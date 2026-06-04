// server/routes/employees.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const Employee = require('../models/Employee');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');



// Apply auth middleware to all employee routes
router.use(authMiddleware);

// Helper function to auto-generate unique Employee ID
const generateEmployeeId = async () => {
  const count = await Employee.count({ paranoid: false }); // Include soft-deleted for ID count to prevent reuse
  const nextIdNum = count + 1;
  return `EMP${String(nextIdNum).padStart(3, '0')}`;
};

// GET /api/employees/stats - Dashboard Statistics
router.get('/stats', async (req, res, next) => {
  try {
    // Total Employees (not soft-deleted)
    const totalEmployees = await Employee.count({ where: { is_deleted: false } });

    // Active Employees (where status is 'Active' and not soft-deleted)
    const activeEmployees = await Employee.count({ 
      where: { 
        is_deleted: false,
        status: 'Active'
      } 
    });

    // Unique Departments (among active employees)
    const departmentsData = await Employee.findAll({
      where: { is_deleted: false, status: 'Active' },
      attributes: ['department'],
      group: ['department']
    });
    const departmentsCount = departmentsData.length;

    // New Employees This Month (only active ones)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await Employee.count({
      where: {
        is_deleted: false,
        status: 'Active',
        joining_date: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Department Distribution (for active employees only)
    const deptDistribution = await Employee.findAll({
      where: { is_deleted: false, status: 'Active' },
      attributes: [
        'department',
        [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count']
      ],
      group: ['department']
    });

    // Employee Growth Statistics (joining count by month for line charts of active employees)
    const employees = await Employee.findAll({
      where: { is_deleted: false, status: 'Active' },
      attributes: ['joining_date'],
      order: [['joining_date', 'ASC']]
    });

    // Process growth data (group by Month-Year)
    const growthStats = {};
    employees.forEach(emp => {
      if (emp.joining_date) {
        const date = new Date(emp.joining_date);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        growthStats[monthYear] = (growthStats[monthYear] || 0) + 1;
      }
    });

    // Cumulative growth
    let runningTotal = 0;
    const growthArray = Object.keys(growthStats).map(key => {
      runningTotal += growthStats[key];
      return { period: key, count: runningTotal };
    });

    // Recent activities (pull latest active hires)
    const recentHires = await Employee.findAll({
      where: { is_deleted: false, status: 'Active' },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'employee_id', 'full_name', 'designation', 'joining_date', 'createdAt']
    });

    res.json({
      totalEmployees,
      activeEmployees,
      departmentsCount,
      newThisMonth,
      deptDistribution,
      growthStats: growthArray,
      recentActivities: recentHires
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/employees - Get list of employees with search, filter, sorting, pagination
router.get('/', async (req, res, next) => {
  try {
    const { search, department, status, sortField, sortOrder, page, limit } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offsetNum = (pageNum - 1) * limitNum;

    // Filter construction
    const whereClause = { is_deleted: false };

    // Search query (matches name, email, department, designation, or employee_id)
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { department: { [Op.like]: `%${search}%` } },
        { employee_id: { [Op.like]: `%${search}%` } },
        { designation: { [Op.like]: `%${search}%` } }
      ];
    }

    // Department filter
    if (department) {
      whereClause.department = department;
    }

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    // Sorting
    let orderClause = [['createdAt', 'DESC']];
    if (sortField) {
      const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
      // Safety check for valid sort fields
      const allowedFields = ['salary', 'joining_date', 'department', 'full_name', 'employee_id'];
      if (allowedFields.includes(sortField)) {
        orderClause = [[sortField, order]];
      }
    }

    const { count, rows } = await Employee.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: limitNum,
      offset: offsetNum
    });

    // Provide total pages
    const totalPages = Math.ceil(count / limitNum);

    res.json({
      employees: rows,
      totalItems: count,
      totalPages,
      currentPage: pageNum
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/employees/:id - Get single employee details
router.get('/:id', async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      where: { id: req.params.id, is_deleted: false }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.json(employee);
  } catch (error) {
    next(error);
  }
});

// POST /api/employees - Create employee
router.post('/', upload.single('profile_image'), async (req, res, next) => {
  try {
    const data = req.body;

    // Auto-generate employee ID if not provided
    if (!data.employee_id || data.employee_id.trim() === '') {
      data.employee_id = await generateEmployeeId();
    } else {
      // Validate unique employee ID
      const existing = await Employee.findOne({ where: { employee_id: data.employee_id } });
      if (existing) {
        return res.status(400).json({ message: `Employee ID ${data.employee_id} already exists.` });
      }
    }

    // Validate unique email
    const existingEmail = await Employee.findOne({ where: { email: data.email } });
    if (existingEmail) {
      return res.status(400).json({ message: `Email ${data.email} is already in use.` });
    }

    // Attach profile image path if uploaded
    if (req.file) {
      data.profile_image = `/uploads/${req.file.filename}`;
    }

    const employee = await Employee.create(data);
    res.status(201).json(employee);
  } catch (error) {
    // Clean up uploaded file if DB creation failed
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', upload.single('profile_image'), async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      where: { id: req.params.id, is_deleted: false }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const data = req.body;

    // Check email uniqueness if changed
    if (data.email && data.email !== employee.email) {
      const existingEmail = await Employee.findOne({ where: { email: data.email } });
      if (existingEmail) {
        return res.status(400).json({ message: `Email ${data.email} is already in use.` });
      }
    }

    // Handle profile image update
    if (req.file) {
      // Delete old profile image if exists
      if (employee.profile_image) {
        const oldPath = path.join(__dirname, '..', employee.profile_image);
        fs.unlink(oldPath, () => {}); // ignore error if file not found
      }
      data.profile_image = `/uploads/${req.file.filename}`;
    }

    await employee.update(data);
    res.json(employee);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', async (req, res, next) => {
  const { type } = req.query; // 'soft' (default) or 'permanent'

  try {
    const employee = await Employee.findOne({
      where: { id: req.params.id }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    if (type === 'permanent') {
      // Delete profile picture if exists
      if (employee.profile_image) {
        const imgPath = path.join(__dirname, '..', employee.profile_image);
        fs.unlink(imgPath, () => {});
      }
      await employee.destroy();
      res.json({ message: 'Employee permanently deleted.' });
    } else {
      // Soft delete
      await employee.update({ is_deleted: true });
      res.json({ message: 'Employee soft-deleted successfully.' });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/employees/import - Import list of employees (bulk create)
router.post('/import', async (req, res, next) => {
  const { employees } = req.body;

  if (!employees || !Array.isArray(employees)) {
    return res.status(400).json({ message: 'Invalid data format. Expected array of employees.' });
  }

  try {
    const importedEmployees = [];
    const errors = [];

    for (let index = 0; index < employees.length; index++) {
      const empData = employees[index];

      // Auto-generate employee ID if not provided
      if (!empData.employee_id || empData.employee_id.trim() === '') {
        empData.employee_id = await generateEmployeeId();
      }

      // Check unique constraints
      const emailDup = await Employee.findOne({ where: { email: empData.email } });
      const idDup = await Employee.findOne({ where: { employee_id: empData.employee_id } });

      if (emailDup) {
        errors.push(`Row ${index + 1}: Email ${empData.email} is already in use.`);
        continue;
      }
      if (idDup) {
        errors.push(`Row ${index + 1}: Employee ID ${empData.employee_id} already exists.`);
        continue;
      }

      // Set default values for required fields if missing
      const record = {
        employee_id: empData.employee_id,
        full_name: empData.full_name || 'Imported Employee',
        email: empData.email,
        phone: empData.phone || '',
        gender: empData.gender || 'Other',
        dob: empData.dob || '1990-01-01',
        department: empData.department || 'General',
        designation: empData.designation || 'Staff',
        salary: empData.salary || 30000,
        joining_date: empData.joining_date || new Date().toISOString().split('T')[0],
        address: empData.address || '',
        profile_image: null,
        status: empData.status || 'Active',
        is_deleted: false
      };

      const newEmp = await Employee.create(record);
      importedEmployees.push(newEmp);
    }

    res.json({
      message: `Import complete. Created ${importedEmployees.length} employees.`,
      successCount: importedEmployees.length,
      errors
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
