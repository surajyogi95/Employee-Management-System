// client/src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  DashboardIcon, 
  EmployeesIcon, 
  ReportsIcon, 
  SettingsIcon, 
  LogoutIcon
} from './Icons';

const Sidebar = () => {
  const { logout, admin } = useAuth();
  const isCollapsed = false;

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { name: 'Employees', path: '/employees', icon: <EmployeesIcon /> },
    { name: 'Reports', path: '/reports', icon: <ReportsIcon /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white border-r border-gray-200 dark:bg-primary-950 dark:border-white/10 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Header / Logo */}
        <div>
          <div className="flex items-center justify-between p-4 h-16 border-b border-gray-100 dark:border-white/10">
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-accent-cyan to-blue-500 bg-clip-text text-transparent font-display">
                EMS PANEL
              </span>
            )}
            {isCollapsed && (
              <span className="text-xl font-extrabold mx-auto text-accent-cyan font-display">E</span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-50/50 dark:bg-accent-cyan/10 text-blue-600 dark:text-accent-cyan nav-active-glow' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                <span className="transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="text-sm font-medium tracking-wide font-sans">
                    {item.name}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer / User Session */}
        <div className="p-3 border-t border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-white/2">
          {/* Admin Avatar & Name */}
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-2 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-cyan to-blue-600 text-white font-semibold font-display">
                {admin?.full_name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate dark:text-white">{admin?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">{admin?.username || 'admin@ems.com'}</p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all duration-200"
          >
            <LogoutIcon className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium tracking-wide">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
