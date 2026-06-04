// client/src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BuildingIcon, DollarIcon, FilePdfIcon } from '../components/Icons';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deptSummary, setDeptSummary] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalBudget: 0,
    averageSalary: 0,
    highestPaidDept: '',
    highestPaidDeptAmt: 0
  });

  useEffect(() => {
    const calculateReports = async () => {
      setLoading(true);
      try {
        // Fetch all active employees (high limit to ensure we compute on full dataset)
        const response = await axios.get('/api/employees', {
          params: { limit: 1000, status: 'Active' }
        });
        const employees = response.data.employees;

        if (employees.length === 0) {
          setDeptSummary([]);
          setLoading(false);
          return;
        }

        // Group by department
        const departments = {};
        let totalBudget = 0;

        employees.forEach(emp => {
          const dept = emp.department;
          const sal = parseFloat(emp.salary) || 0;
          totalBudget += sal;

          if (!departments[dept]) {
            departments[dept] = {
              name: dept,
              count: 0,
              budget: 0,
              maxSalary: 0,
              minSalary: Infinity
            };
          }

          departments[dept].count += 1;
          departments[dept].budget += sal;
          if (sal > departments[dept].maxSalary) departments[dept].maxSalary = sal;
          if (sal < departments[dept].minSalary) departments[dept].minSalary = sal;
        });

        // Format and finalize summaries
        const summaryArray = Object.keys(departments).map(key => {
          const dept = departments[key];
          return {
            ...dept,
            averageSalary: dept.count > 0 ? (dept.budget / dept.count) : 0,
            minSalary: dept.minSalary === Infinity ? 0 : dept.minSalary
          };
        });

        // Find highest paid department
        let highestPaidDept = '';
        let highestPaidDeptAmt = 0;
        summaryArray.forEach(d => {
          if (d.budget > highestPaidDeptAmt) {
            highestPaidDept = d.name;
            highestPaidDeptAmt = d.budget;
          }
        });

        setDeptSummary(summaryArray);
        setOverallStats({
          totalBudget,
          averageSalary: totalBudget / employees.length,
          highestPaidDept,
          highestPaidDeptAmt
        });
      } catch (err) {
        console.error('Error generating reports:', err);
        setError('Failed to compute department analytics reports.');
      } finally {
        setLoading(false);
      }
    };

    calculateReports();
  }, []);

  // PDF print report
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString();

    const tableRows = deptSummary.map(d => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>${d.name}</b></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${d.count}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${d.budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${d.averageSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${d.maxSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Department Payroll Budget Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 30px; }
            .header { border-bottom: 2px solid #00d1ff; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; }
            .title { font-size: 20px; font-weight: bold; color: #0a0e2c; }
            .date { font-size: 11px; color: #777; align-self: flex-end; }
            .summary-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background-color: #fafafa; }
            .card-label { font-size: 11px; color: #666; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
            .card-val { font-size: 20px; font-weight: bold; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; background-color: #0a0e2c; color: white; padding: 10px; font-size: 12px; }
            td { font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Department Payroll Budget Report</div>
            <div class="date">Generated on: ${today}</div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-label">Total Payroll Budget (Annual)</div>
              <div class="card-val">$${overallStats.totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
            <div class="card">
              <div class="card-label">Average Annual Salary</div>
              <div class="card-val">$${overallStats.averageSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th style="text-align: center;">Headcount</th>
                <th style="text-align: right;">Total Budget</th>
                <th style="text-align: right;">Average Salary</th>
                <th style="text-align: right;">Highest Salary</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel h-28 rounded-2xl bg-gray-200/50 dark:bg-white/5"></div>
          <div className="glass-panel h-28 rounded-2xl bg-gray-200/50 dark:bg-white/5"></div>
        </div>
        <div className="glass-panel h-80 rounded-2xl bg-gray-200/50 dark:bg-white/5"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  // Bar chart configurations
  const maxBudget = deptSummary.length > 0 ? Math.max(...deptSummary.map(d => d.budget)) : 1;
  const chartColors = ['bg-accent-cyan', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500'];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Title & Print */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white font-display">Operational Analytics</h2>
          <p className="text-xs text-gray-400">Department financial breakdowns and salaries allocations</p>
        </div>
        <button
          onClick={handlePrintReport}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition shadow-sm"
        >
          <FilePdfIcon className="w-4 h-4 text-red-500" />
          Print Budget Report
        </button>
      </div>

      {/* Financial Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Total Annual Payroll Budget</p>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-display font-mono">
              ${overallStats.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><DollarIcon className="w-6 h-6" /></div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Average Employee Salary</p>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-display font-mono">
              ${overallStats.averageSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-accent-cyan"><BuildingIcon className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Custom Bar Chart Visualisation */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-white font-display font-semibold">Department Budget Allocation</h3>
          <p className="text-xs text-gray-400">Comparing total salary budget across departments</p>
        </div>

        <div className="space-y-4 pt-2">
          {deptSummary.map((dept, idx) => {
            const ratio = dept.budget / maxBudget;
            const barWidth = `${(ratio * 100).toFixed(0)}%`;
            const colorClass = chartColors[idx % chartColors.length];

            return (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-800 dark:text-gray-200">{dept.name} ({dept.count} staff)</span>
                  <span className="font-semibold font-mono dark:text-white">${dept.budget.toLocaleString()}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
                    style={{ width: barWidth }}
                  ></div>
                </div>
              </div>
            );
          })}

          {deptSummary.length === 0 && (
            <p className="text-sm text-gray-500 py-4 text-center">No department budget details available.</p>
          )}
        </div>
      </div>

      {/* Details Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400">Department</th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400 text-center">Headcount</th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400 text-right">Total Budget</th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400 text-right">Average Salary</th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400 text-right">Max Salary</th>
                <th className="px-5 py-4 font-bold text-gray-500 dark:text-gray-400 text-right">Min Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {deptSummary.map(dept => (
                <tr key={dept.name} className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition">
                  <td className="px-5 py-4 font-semibold text-gray-800 dark:text-white">{dept.name}</td>
                  <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-300 font-medium">{dept.count}</td>
                  <td className="px-5 py-4 text-right font-mono font-semibold dark:text-white">${dept.budget.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-mono text-gray-600 dark:text-gray-300">${Math.round(dept.averageSalary).toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-mono text-gray-600 dark:text-gray-300">${parseFloat(dept.maxSalary).toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-mono text-gray-600 dark:text-gray-300">${parseFloat(dept.minSalary).toLocaleString()}</td>
                </tr>
              ))}

              {deptSummary.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-sm text-gray-500">
                    No department budget rows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
