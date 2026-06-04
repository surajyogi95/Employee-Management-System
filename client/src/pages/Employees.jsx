// client/src/pages/Employees.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import EmployeeModal from '../components/EmployeeModal';
import { 
  SearchIcon, 
  FilterIcon, 
  TrashIcon, 
  EditIcon, 
  ViewIcon, 
  SortIcon,
  FileExcelIcon,
  FilePdfIcon,
  ImportIcon,
  AddIcon
} from '../components/Icons';
import { Link } from 'react-router-dom';

const Employees = () => {
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Core Data States
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [departments, setDepartments] = useState([]);

  // Query States
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [sortField, setSortField] = useState('employee_id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals Toggles
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Status Alerts
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Trigger modal if query param says ?action=add
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add') {
      setSelectedEmployee(null);
      setFormOpen(true);
    }
  }, [location]);

  // Fetch unique departments for filters
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/employees/stats');
      const depts = response.data.deptDistribution.map(d => d.department);
      setDepartments(depts);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Fetch Employees List
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/employees', {
        params: {
          search,
          department: selectedDept,
          sortField,
          sortOrder,
          page: currentPage,
          limit: 8
        }
      });
      setEmployees(response.data.employees);
      setTotalItems(response.data.totalItems);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching employees:', err);
      showAlert('danger', 'Failed to retrieve employee record list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept, sortField, sortOrder, currentPage]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 4000);
  };

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Save/Edit trigger
  const handleSaveSuccess = () => {
    fetchEmployees();
    fetchDepartments();
    showAlert('success', 'Employee database updated successfully.');
  };

  // Delete Action trigger
  const handleDeleteConfirm = async (deleteType) => {
    if (!employeeToDelete) return;

    try {
      await axios.delete(`/api/employees/${employeeToDelete.id}`, {
        params: { type: deleteType }
      });
      fetchEmployees();
      fetchDepartments();
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
      showAlert('success', deleteType === 'permanent' ? 'Employee permanently deleted.' : 'Employee soft-deleted.');
    } catch (err) {
      console.error('Error deleting employee:', err);
      showAlert('danger', 'Delete operation failed.');
    }
  };

  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === 'Inactive' ? 'Active' : 'Inactive';
    try {
      await axios.put(`/api/employees/${emp.id}`, { status: newStatus });
      fetchEmployees();
      showAlert('success', `Employee status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Error toggling employee status:', err);
      showAlert('danger', 'Failed to update employee status.');
    }
  };

  // 1. EXPORT TO CSV (EXCEL FRIENDLY)
  const handleExportCSV = () => {
    if (employees.length === 0) {
      showAlert('warning', 'Roster table is empty. Nothing to export.');
      return;
    }

    const headers = [
      'ID', 'Employee ID', 'Full Name', 'Email', 'Phone', 
      'Gender', 'DOB', 'Department', 'Designation', 'Salary', 'Joining Date', 'Address'
    ];

    const rows = employees.map(emp => [
      emp.id,
      `"${emp.employee_id}"`,
      `"${emp.full_name}"`,
      `"${emp.email}"`,
      `"${emp.phone || ''}"`,
      `"${emp.gender}"`,
      emp.dob,
      `"${emp.department}"`,
      `"${emp.designation}"`,
      emp.salary,
      emp.joining_date,
      `"${emp.address || ''}"`
    ]);

    const csvContent = "\ufeff" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `EMS_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. EXPORT TO PDF (PRINT STYLE INTERACTION)
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString();

    const tableRowsHtml = employees.map(emp => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${emp.employee_id}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><b>${emp.full_name}</b></td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${emp.email}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${emp.department}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${emp.designation}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${parseFloat(emp.salary).toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(emp.joining_date).toLocaleDateString()}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>EMS Employee Roster Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 30px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #00d1ff; padding-bottom: 10px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #0a0e2c; }
            .date { font-size: 12px; color: #666; align-self: flex-end; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { background-color: #f5f5f5; text-align: left; padding: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">EMS Employee Roster Report</div>
            <div class="date">Generated on: ${today}</div>
          </div>
          <p>Total Records: ${totalItems}</p>
          <table>
            <thead>
              <tr>
                <th style="width: 10%;">ID</th>
                <th style="width: 20%;">Name</th>
                <th style="width: 20%;">Email</th>
                <th style="width: 15%;">Department</th>
                <th style="width: 15%;">Designation</th>
                <th style="text-align: right; width: 10%;">Salary</th>
                <th style="width: 10%;">Joining Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    // Delay slightly to allow layout rendering before triggering print modal
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // 3. IMPORT FROM CSV
  const handleCSVImportClick = () => {
    fileInputRef.current.click();
  };

  const handleCSVFileUploaded = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      try {
        const parsedRows = parseCSV(text);
        if (parsedRows.length === 0) {
          showAlert('warning', 'No record rows detected in uploading file.');
          return;
        }

        const response = await axios.post('/api/employees/import', { employees: parsedRows });
        fetchEmployees();
        fetchDepartments();
        
        const errors = response.data.errors;
        if (errors.length > 0) {
          showAlert('warning', `Imported ${response.data.successCount} profiles. Warnings: ${errors.join(', ')}`);
        } else {
          showAlert('success', `Successfully imported all ${response.data.successCount} employees from template.`);
        }
      } catch (err) {
        console.error('Error importing CSV:', err);
        showAlert('danger', 'CSV upload parsing or DB validation failed.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Clear file input value
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle commas inside quotes
      const values = [];
      let isInsideQuote = false;
      let startIdx = 0;
      
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '"') {
          isInsideQuote = !isInsideQuote;
        } else if (line[j] === ',' && !isInsideQuote) {
          values.push(line.substring(startIdx, j).trim().replace(/^"|"$/g, ''));
          startIdx = j + 1;
        }
      }
      // Add last value
      values.push(line.substring(startIdx).trim().replace(/^"|"$/g, ''));

      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      results.push(obj);
    }
    return results;
  };

  // Download simple import template
  const downloadImportTemplate = () => {
    const headers = 'employee_id,full_name,email,phone,gender,dob,department,designation,salary,joining_date,address';
    const sample = 'EMP099,John Doe,john.doe@company.com,+15550299,Male,1990-05-10,Engineering,Software Specialist,85000,2025-06-01,"123 Tech Dr, Seattle WA"';
    const csvContent = "data:text/csv;charset=utf-8," + [headers, sample].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ems_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Notifications Alert banner */}
      {alert.message && (
        <div className={`p-4 text-sm border rounded-2xl animate-fade-in ${
          alert.type === 'success' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
          alert.type === 'warning' ? 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
          'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
        }`}>
          {alert.message}
        </div>
      )}

      {/* Page Title & Utility Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white font-display">Employee Roster</h2>
          <p className="text-xs text-gray-400">Manage, sort, filter, and import/export company personnel records</p>
        </div>

        {/* Buttons Panel */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Template helper */}
          <button
            onClick={downloadImportTemplate}
            className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 transition"
          >
            Get Import CSV Template
          </button>

          {/* Import */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCSVFileUploaded}
            className="hidden"
          />
          <button
            onClick={handleCSVImportClick}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-250 rounded-xl text-xs font-semibold transition"
          >
            <ImportIcon className="w-4 h-4" />
            Import CSV
          </button>

          {/* Export Panel */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-250 rounded-xl text-xs font-semibold transition"
          >
            <FileExcelIcon className="w-4 h-4 text-emerald-500" />
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-250 rounded-xl text-xs font-semibold transition"
          >
            <FilePdfIcon className="w-4 h-4 text-red-500" />
            Print PDF
          </button>

          {/* Add Employee Button */}
          <button
            onClick={() => {
              setSelectedEmployee(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-cyan-500/10 active:scale-[0.98] transition"
          >
            <AddIcon className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Search & Filters Row */}
      <div className="glass-panel p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <SearchIcon className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, name, email, or dept..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition text-sm"
          />
        </div>

        {/* Filter Department */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <FilterIcon className="w-4 h-4" />
          </span>
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-primary-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition text-sm"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Info label */}
        <div className="text-right text-xs text-gray-400 font-medium">
          Showing <span className="text-gray-700 dark:text-white font-semibold">{employees.length}</span> of <span className="text-gray-700 dark:text-white font-semibold">{totalItems}</span> roster profiles
        </div>
      </div>

      {/* Roster Data Table Grid */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto table-container">
          <table className="min-w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-150 dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400">
                  <button onClick={() => handleSort('employee_id')} className="flex items-center gap-1 hover:text-accent-cyan transition">
                    ID {sortField === 'employee_id' && <SortIcon />}
                  </button>
                </th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400">
                  <button onClick={() => handleSort('full_name')} className="flex items-center gap-1 hover:text-accent-cyan transition">
                    Full Name {sortField === 'full_name' && <SortIcon />}
                  </button>
                </th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400">
                  <button onClick={() => handleSort('department')} className="flex items-center gap-1 hover:text-accent-cyan transition">
                    Department {sortField === 'department' && <SortIcon />}
                  </button>
                </th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400">Designation</th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400">
                  <button onClick={() => handleSort('salary')} className="flex items-center gap-1 hover:text-accent-cyan transition">
                    Salary {sortField === 'salary' && <SortIcon />}
                  </button>
                </th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400">
                  <button onClick={() => handleSort('joining_date')} className="flex items-center gap-1 hover:text-accent-cyan transition">
                    Joining Date {sortField === 'joining_date' && <SortIcon />}
                  </button>
                </th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400">
                  <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-accent-cyan transition">
                    Status {sortField === 'status' && <SortIcon />}
                  </button>
                </th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                // Skeletons
                [1, 2, 3, 4, 5].map(n => (
                  <tr key={n} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16"></div></td>
                    <td className="px-5 py-4"><div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition">
                    {/* ID */}
                    <td className="px-5 py-4 font-semibold font-mono text-gray-500 dark:text-gray-400">
                      {emp.employee_id}
                    </td>

                    {/* Avatar & Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-accent-cyan flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                          {emp.profile_image ? (
                            <img src={emp.profile_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            emp.full_name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white leading-none mb-1">
                            {emp.full_name}
                          </p>
                          <p className="text-xs text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {emp.department}
                    </td>

                    {/* Designation */}
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {emp.designation}
                    </td>

                    {/* Salary */}
                    <td className="px-5 py-4 font-semibold font-mono text-gray-800 dark:text-white">
                      ${parseFloat(emp.salary).toLocaleString()}
                    </td>

                    {/* Joining Date */}
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(emp.joining_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          emp.status === 'Inactive'
                            ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {emp.status || 'Active'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <Link
                          to={`/employees/${emp.id}`}
                          className="p-1.5 text-gray-500 hover:text-accent-cyan hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition"
                          title="View Profile Details"
                        >
                          <ViewIcon className="w-4 h-4" />
                        </Link>
                        {/* Edit */}
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setFormOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition"
                          title="Edit Employee Information"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => {
                            setEmployeeToDelete(emp);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition"
                          title="Delete Employee Record"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && employees.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-sm text-gray-500">
                    No matching employee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/2 flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-3.5 py-2 text-xs font-semibold border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition disabled:opacity-50 text-gray-700 dark:text-gray-300"
            >
              Previous Page
            </button>
            <span className="text-xs text-gray-500">
              Page <span className="font-semibold text-gray-800 dark:text-white">{currentPage}</span> of <span className="font-semibold text-gray-800 dark:text-white">{totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="px-3.5 py-2 text-xs font-semibold border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition disabled:opacity-50 text-gray-700 dark:text-gray-300"
            >
              Next Page
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal Drawer */}
      <EmployeeModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        employee={selectedEmployee}
        onSave={handleSaveSuccess}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModalOpen(false)}></div>
          
          {/* Card Dialog */}
          <div className="relative w-full max-w-md bg-white dark:bg-primary-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 font-display">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold dark:text-white">{employeeToDelete?.full_name}</span> ({employeeToDelete?.employee_id})? 
              Choose how you want to perform this deletion.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleDeleteConfirm('soft')}
                className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition"
              >
                Soft Delete (Flag as inactive, keep in database)
              </button>
              <button
                onClick={() => handleDeleteConfirm('permanent')}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition"
              >
                Permanent Delete (Erase completely from database)
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="w-full py-2.5 px-4 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-semibold rounded-xl text-sm transition mt-1.5"
              >
                Keep Record (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
