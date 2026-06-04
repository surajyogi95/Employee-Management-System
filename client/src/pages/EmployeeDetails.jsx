// client/src/pages/EmployeeDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import EmployeeModal from '../components/EmployeeModal';
import { 
  BuildingIcon, 
  DollarIcon, 
  DateIcon, 
  PhoneIcon, 
  MailIcon, 
  MapIcon, 
  CalendarIcon,
  EditIcon,
  FilePdfIcon
} from '../components/Icons';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formOpen, setFormOpen] = useState(false);

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/employees/${id}`);
      setEmployee(response.data);
    } catch (err) {
      console.error('Error fetching employee:', err);
      setError('Employee profile not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const handleEditSave = (updatedEmp) => {
    setEmployee(updatedEmp);
    fetchEmployeeDetails();
  };

  const handlePrintDossier = () => {
    if (!employee) return;
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString();

    const htmlContent = `
      <html>
        <head>
          <title>Employee Dossier - ${employee.full_name}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 40px; }
            .header { display: flex; align-items: center; border-bottom: 2px solid #00d1ff; padding-bottom: 20px; margin-bottom: 30px; }
            .avatar { width: 100px; height: 100px; border-radius: 12px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold; overflow: hidden; margin-right: 25px; }
            .avatar img { width: 100%; height: 100%; object-cover: cover; }
            .title-info h1 { margin: 0 0 5px 0; font-size: 24px; color: #0a0e2c; }
            .title-info p { margin: 0; font-size: 14px; color: #666; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #0a0e2c; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .item { font-size: 13px; }
            .label { font-weight: bold; color: #555; margin-bottom: 3px; }
            .val { color: #111; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="avatar">
              ${employee.profile_image 
                ? `<img src="${window.location.origin}${employee.profile_image}" alt="" />`
                : employee.full_name.charAt(0)
              }
            </div>
            <div class="title-info">
              <h1>${employee.full_name}</h1>
              <p>${employee.designation} &bull; ${employee.department}</p>
              <p style="margin-top: 5px; font-family: monospace; font-weight: bold;">ID: ${employee.employee_id}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Employment Information</div>
            <div class="grid">
              <div class="item"><div class="label">Department</div><div class="val">${employee.department}</div></div>
              <div class="item"><div class="label">Designation</div><div class="val">${employee.designation}</div></div>
              <div class="item"><div class="label">Annual Salary</div><div class="val">$${parseFloat(employee.salary).toLocaleString()}</div></div>
              <div class="item"><div class="label">Date of Joining</div><div class="val">${new Date(employee.joining_date).toLocaleDateString()}</div></div>
            </div>
          </div>

          <div class="section" style="margin-top: 30px;">
            <div class="section-title">Personal Details</div>
            <div class="grid">
              <div class="item"><div class="label">Email Address</div><div class="val">${employee.email}</div></div>
              <div class="item"><div class="label">Phone Number</div><div class="val">${employee.phone || 'N/A'}</div></div>
              <div class="item"><div class="label">Gender</div><div class="val">${employee.gender}</div></div>
              <div class="item"><div class="label">Date of Birth</div><div class="val">${new Date(employee.dob).toLocaleDateString()}</div></div>
              <div class="item" style="grid-column: span 2;"><div class="label">Residential Address</div><div class="val">${employee.address || 'N/A'}</div></div>
            </div>
          </div>

          <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px;">
            EMS Official Employee Profile Dossier &bull; Generated on ${today}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };



  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="glass-panel h-48 rounded-3xl bg-gray-200/50 dark:bg-white/5"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel h-64 rounded-3xl bg-gray-200/50 dark:bg-white/5"></div>
          <div className="glass-panel h-64 rounded-3xl bg-gray-200/50 dark:bg-white/5"></div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6 text-center">
        <div className="glass-panel p-8 max-w-md mx-auto space-y-4">
          <p className="text-red-500 font-semibold">{error || 'Failed to load employee details.'}</p>
          <Link to="/employees" className="inline-block px-4 py-2 bg-accent-cyan text-black rounded-xl font-semibold">
            Back to Roster
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Back button & controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Roster
        </button>

        <div className="flex items-center gap-2">
          {/* Print Dossier */}
          <button
            onClick={handlePrintDossier}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition"
          >
            <FilePdfIcon className="w-4 h-4 text-red-500" />
            Print Dossier
          </button>
          {/* Edit */}
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-cyan-500/10 active:scale-[0.98] transition"
          >
            <EditIcon className="w-4 h-4 text-white" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Header Badge */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-28 h-28 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
          {employee.profile_image ? (
            <img src={employee.profile_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-extrabold text-blue-600 dark:text-accent-cyan font-display">
              {employee.full_name.charAt(0)}
            </span>
          )}
        </div>

        <div className="text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row items-center gap-2.5">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-display">
              {employee.full_name}
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-blue-50 dark:bg-accent-cyan/10 text-blue-600 dark:text-accent-cyan rounded-md border border-blue-100 dark:border-accent-cyan/10">
              {employee.employee_id}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {employee.designation} &bull; <span className="text-accent-cyan">{employee.department}</span>
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-400 pt-1">
            <span className="flex items-center gap-1"><MailIcon className="w-4 h-4" /> {employee.email}</span>
            {employee.phone && <span className="flex items-center gap-1"><PhoneIcon className="w-4 h-4" /> {employee.phone}</span>}
          </div>
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employment Information */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="border-b border-gray-100 dark:border-white/5 pb-3">
            <h3 className="text-base font-bold text-gray-800 dark:text-white font-display">Employment Details</h3>
            <p className="text-[10px] text-gray-400">Official workplace parameters</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-accent-cyan flex-shrink-0"><BuildingIcon className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Department</p>
                <p className="text-sm font-semibold dark:text-white">{employee.department}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Designation</p>
                <p className="text-sm font-semibold dark:text-white">{employee.designation}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0"><DollarIcon className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Annual Salary</p>
                <p className="text-sm font-bold font-mono dark:text-white">${parseFloat(employee.salary).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex-shrink-0"><DateIcon className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Date of Joining</p>
                <p className="text-sm font-semibold dark:text-white">{new Date(employee.joining_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="border-b border-gray-100 dark:border-white/5 pb-3">
            <h3 className="text-base font-bold text-gray-800 dark:text-white font-display">Personal Profile</h3>
            <p className="text-[10px] text-gray-400">Private demographics data</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Gender</p>
                <p className="text-sm font-semibold dark:text-white">{employee.gender}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex-shrink-0"><CalendarIcon className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Date of Birth</p>
                <p className="text-sm font-semibold dark:text-white">{new Date(employee.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex-shrink-0"><MapIcon className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Residential Address</p>
                <p className="text-sm font-medium dark:text-white">{employee.address || 'No residential address recorded.'}</p>
              </div>
            </div>
        </div>


      </div>

      {/* Edit Form Modal Drawer */}
      <EmployeeModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        employee={employee}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default EmployeeDetails;
