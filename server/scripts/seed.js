// server/scripts/seed.js
require('dotenv').config({ path: '../.env' }); // Load .env from parent directory
const bcrypt = require('bcryptjs');
const { sequelize, Admin, Employee } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await sequelize.authenticate();
    console.log('Connection established. Syncing database schemas...');
    
    // Force sync db (drops existing tables)
    await sequelize.sync({ force: true });
    console.log('Tables recreated successfully.');

    // Seed Admin User
    const adminPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash(adminPassword, salt);

    await Admin.create({
      username: 'admin@ems.com',
      password: hashedAdminPassword,
      full_name: 'System Administrator'
    });
    console.log('Seeded Admin: admin@ems.com / admin123');

    // Seed Employees
    const sampleEmployees = [
      {
        employee_id: 'EMP001',
        full_name: 'Alice Johnson',
        email: 'alice.j@company.com',
        phone: '+15550100',
        gender: 'Female',
        dob: '1992-05-15',
        department: 'Engineering',
        designation: 'Senior Backend Engineer',
        salary: 95000.00,
        joining_date: '2024-01-10',
        address: '123 Tech Lane, Silicon Valley, CA',
        profile_image: null
      },
      {
        employee_id: 'EMP002',
        full_name: 'Bob Smith',
        email: 'bob.smith@company.com',
        phone: '+15550101',
        gender: 'Male',
        dob: '1988-09-21',
        department: 'Marketing',
        designation: 'Content Strategy Lead',
        salary: 68000.00,
        joining_date: '2024-03-01',
        address: '456 Creative Way, San Francisco, CA',
        profile_image: null
      },
      {
        employee_id: 'EMP003',
        full_name: 'Catherine Chen',
        email: 'catherine.c@company.com',
        phone: '+15550102',
        gender: 'Female',
        dob: '1995-11-04',
        department: 'Engineering',
        designation: 'Frontend Developer',
        salary: 75000.00,
        joining_date: '2024-06-15',
        address: '789 Pixel St, Seattle, WA',
        profile_image: null
      },
      {
        employee_id: 'EMP004',
        full_name: 'David Miller',
        email: 'david.miller@company.com',
        phone: '+15550103',
        gender: 'Male',
        dob: '1985-02-12',
        department: 'Human Resources',
        designation: 'HR Director',
        salary: 82000.00,
        joining_date: '2023-08-20',
        address: '101 People Boulevard, New York, NY',
        profile_image: null
      },
      {
        employee_id: 'EMP005',
        full_name: 'Emily Davis',
        email: 'emily.davis@company.com',
        phone: '+15550104',
        gender: 'Female',
        dob: '1993-07-28',
        department: 'Sales',
        designation: 'Account Executive',
        salary: 62000.00,
        joining_date: '2024-09-01',
        address: '202 Deal Drive, Chicago, IL',
        profile_image: null
      },
      {
        employee_id: 'EMP006',
        full_name: 'Frank Miller',
        email: 'frank.miller@company.com',
        phone: '+15550105',
        gender: 'Male',
        dob: '1990-12-10',
        department: 'Finance',
        designation: 'Financial Analyst',
        salary: 72000.00,
        joining_date: '2024-11-10',
        address: '303 Ledger Ave, Boston, MA',
        profile_image: null
      },
      {
        employee_id: 'EMP007',
        full_name: 'Grace Hopper',
        email: 'grace.h@company.com',
        phone: '+15550106',
        gender: 'Female',
        dob: '1980-12-09',
        department: 'Engineering',
        designation: 'Principal Architect',
        salary: 135000.00,
        joining_date: '2023-01-15',
        address: '404 Compiler Rd, Austin, TX',
        profile_image: null
      },
      {
        employee_id: 'EMP008',
        full_name: 'Henry Taylor',
        email: 'henry.t@company.com',
        phone: '+15550107',
        gender: 'Male',
        dob: '1996-03-30',
        department: 'Sales',
        designation: 'Sales Representative',
        salary: 48000.00,
        joining_date: '2025-02-01',
        address: '505 Funnel Pl, Atlanta, GA',
        profile_image: null
      },
      {
        employee_id: 'EMP009',
        full_name: 'Ivy Zhang',
        email: 'ivy.z@company.com',
        phone: '+15550108',
        gender: 'Female',
        dob: '1994-08-18',
        department: 'Design',
        designation: 'Lead UI/UX Designer',
        salary: 80000.00,
        joining_date: '2024-04-10',
        address: '606 Palette Ct, Portland, OR',
        profile_image: null
      },
      {
        employee_id: 'EMP010',
        full_name: 'Jack Wilson',
        email: 'jack.w@company.com',
        phone: '+15550109',
        gender: 'Male',
        dob: '1987-04-05',
        department: 'Marketing',
        designation: 'SEO Specialist',
        salary: 56000.00,
        joining_date: '2025-04-20',
        address: '707 Traffic Way, Denver, CO',
        profile_image: null
      }
    ];

    await Employee.bulkCreate(sampleEmployees);
    console.log(`Seeded ${sampleEmployees.length} mock employees.`);
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
