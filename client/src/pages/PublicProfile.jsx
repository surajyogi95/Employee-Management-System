// client/src/pages/PublicProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MailIcon, PhoneIcon, MapIcon, BuildingIcon, DateIcon } from '../components/Icons';

const PublicProfile = () => {
  const { employee_id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setLoading(true);
      try {
        // Fetch from the public read-only endpoint
        const response = await axios.get(`/api/employees/public/${employee_id}`);
        setEmployee(response.data);
      } catch (err) {
        console.error('Error fetching public employee profile:', err);
        setError('Employee profile could not be retrieved. It may not exist or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    if (employee_id) {
      fetchPublicProfile();
    }
  }, [employee_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0e2c] p-4">
        <div className="glass-panel p-6 max-w-sm w-full space-y-4 animate-pulse">
          <div className="mx-auto w-24 h-24 rounded-2xl bg-gray-200 dark:bg-white/10"></div>
          <div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2 mx-auto"></div>
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0e2c] p-4 text-center">
        <div className="glass-panel p-8 max-w-sm w-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white font-display">Profile Not Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0e2c] p-4 overflow-hidden">
      {/* Background Ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-accent-cyan/10 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/5 blur-[90px] pointer-events-none"></div>

      {/* Profile Card */}
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/20 dark:border-white/10 shadow-glass-light dark:shadow-glass-dark z-10 space-y-6 text-center animate-slide-up">
        {/* Avatar */}
        <div className="relative mx-auto w-24 h-24 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
          {employee.profile_image ? (
            <img src={employee.profile_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-extrabold text-blue-600 dark:text-accent-cyan font-display">
              {employee.full_name.charAt(0)}
            </span>
          )}
        </div>

        {/* Identity */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-bold text-gray-850 dark:text-white font-display leading-none">
              {employee.full_name}
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-blue-50 dark:bg-accent-cyan/15 text-blue-600 dark:text-accent-cyan rounded border border-blue-100 dark:border-accent-cyan/10">
              {employee.employee_id}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {employee.designation} &bull; <span className="text-accent-cyan">{employee.department}</span>
          </p>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE EMPLOYEE
          </div>
        </div>

        {/* Details Divider */}
        <div className="h-px bg-gray-100 dark:bg-white/5 my-2"></div>

        {/* Profile Stats List */}
        <div className="text-left space-y-3.5 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-accent-cyan flex-shrink-0">
              <BuildingIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Workplace</p>
              <p className="font-semibold">{employee.designation} ({employee.department})</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <MailIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Email Contact</p>
              <p className="font-semibold">{employee.email}</p>
            </div>
          </div>

          {employee.phone && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex-shrink-0">
                <PhoneIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Phone Number</p>
                <p className="font-semibold">{employee.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <DateIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Date of Joining</p>
              <p className="font-semibold">{new Date(employee.joining_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {employee.address && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex-shrink-0">
                <MapIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 font-sans tracking-wide">Location Address</p>
                <p className="font-semibold truncate max-w-[240px]">{employee.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-[10px] text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-white/5 font-mono">
          EMS VERIFIED ACCOUNT
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
