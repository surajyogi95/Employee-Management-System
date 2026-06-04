// client/src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import Reports from './pages/Reports';
import Settings from './pages/Settings';


// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Main Layout Wrapper
const AppLayout = () => {
  const location = useLocation();

  // Helper to calculate page titles based on routes
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path === '/employees') return 'Employee Roster Directory';
    if (path.startsWith('/employees/')) return 'Employee Profile Dossier';
    if (path === '/reports') return 'Operational Financial Reports';
    if (path === '/settings') return 'Control Panel Settings';
    return 'HR Management Admin';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0e2c] text-gray-800 dark:text-gray-150 transition-colors duration-250">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 pl-64">
        {/* Header toolbar */}
        <Header title={getPageTitle()} />

        {/* Child Router Screens */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Route wrapper redirecting logged in admins away from Login page
const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>


            {/* Login Route (Public, redirects if auth token exists) */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />

            {/* Dashboard Protected Admin Shell Routes */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
