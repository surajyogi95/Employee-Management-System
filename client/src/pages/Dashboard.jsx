// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import { 
  EmployeesIcon, 
  BuildingIcon, 
  AddIcon, 
  DateIcon,
  FileExcelIcon,
  FilePdfIcon,
  ImportIcon
} from '../components/Icons';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/employees/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="glass-panel h-32 rounded-2xl bg-gray-200/50 dark:bg-white/5"></div>
          ))}
        </div>
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel h-80 rounded-2xl bg-gray-200/50 dark:bg-white/5"></div>
          <div className="glass-panel h-80 rounded-2xl bg-gray-200/50 dark:bg-white/5"></div>
        </div>
      </div>
    );
  }

  // Fallbacks for data structures
  const totalEmployees = stats?.totalEmployees || 0;
  const activeEmployees = stats?.activeEmployees || 0;
  const departmentsCount = stats?.departmentsCount || 0;
  const newThisMonth = stats?.newThisMonth || 0;
  const recentActivities = stats?.recentActivities || [];
  const growthStats = stats?.growthStats || [];
  const deptDistribution = stats?.deptDistribution || [];

  // 1. CUSTOM SVG DOUGHNUT CHART SETUP
  const colors = ['#00d1ff', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];
  const totalDeptCount = deptDistribution.reduce((acc, curr) => acc + parseInt(curr.count, 10), 0);
  let accumulatedAngle = 0;

  const doughnutSegments = deptDistribution.map((dept, index) => {
    const count = parseInt(dept.count, 10);
    const percentage = totalDeptCount > 0 ? (count / totalDeptCount) : 0;
    const angle = percentage * 360;
    const color = colors[index % colors.length];
    
    // Circle dash calculations
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage * circumference).toFixed(2)} ${(circumference - percentage * circumference).toFixed(2)}`;
    const strokeDashoffset = `${(-accumulatedAngle / 360 * circumference).toFixed(2)}`;
    
    accumulatedAngle += angle;

    return {
      name: dept.department,
      count,
      percentage: (percentage * 100).toFixed(0),
      color,
      strokeDasharray,
      strokeDashoffset,
      radius,
      cx: 100,
      cy: 100
    };
  });

  // 2. CUSTOM SVG LINE CHART SETUP (Employee Growth)
  const lineChartWidth = 500;
  const lineChartHeight = 180;
  const padding = { top: 20, right: 30, bottom: 30, left: 40 };

  const getMaxCount = () => {
    if (growthStats.length === 0) return 10;
    const maxVal = Math.max(...growthStats.map(d => d.count));
    return maxVal > 0 ? maxVal + 2 : 10;
  };
  const maxVal = getMaxCount();

  const getPoints = () => {
    if (growthStats.length === 0) return '';
    const xStep = (lineChartWidth - padding.left - padding.right) / Math.max(1, growthStats.length - 1);
    
    return growthStats.map((d, i) => {
      const x = padding.left + i * xStep;
      const y = lineChartHeight - padding.bottom - ((d.count / maxVal) * (lineChartHeight - padding.top - padding.bottom));
      return { x, y, label: d.period, count: d.count };
    });
  };

  const points = getPoints();
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${lineChartHeight - padding.bottom} L ${points[0].x} ${lineChartHeight - padding.bottom} Z`
    : '';

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-2xl">
          {error}
        </div>
      )}

      {/* Stats Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={<EmployeesIcon className="w-6 h-6" />}
          description="Registered on roster"
          trend="+4.2%"
          trendType="success"
        />
        <StatCard
          title="Active Employees"
          value={activeEmployees}
          icon={<EmployeesIcon className="w-6 h-6 text-emerald-500" />}
          description="Full-time active staff"
          trend="Stable"
          trendType="success"
        />
        <StatCard
          title="Total Departments"
          value={departmentsCount}
          icon={<BuildingIcon className="w-6 h-6 text-amber-500" />}
          description="Operational departments"
          trend="+1"
          trendType="success"
        />
        <StatCard
          title="New This Month"
          value={newThisMonth}
          icon={<DateIcon className="w-6 h-6 text-indigo-500" />}
          description="Hired since month start"
          trend="+12%"
          trendType="success"
        />
      </section>

      {/* Analytics Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Line Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white font-display">Employee Growth Trend</h3>
            <p className="text-xs text-gray-400">Cumulative staff additions over time</p>
          </div>
          
          <div className="relative w-full h-48">
            {points.length > 0 ? (
              <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} className="w-full h-full">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d1ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00d1ff" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                  const yVal = padding.top + r * (lineChartHeight - padding.top - padding.bottom);
                  return (
                    <line
                      key={idx}
                      x1={padding.left}
                      y1={yVal}
                      x2={lineChartWidth - padding.right}
                      y2={yVal}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Areas & Lines */}
                <path d={areaPath} fill="url(#chartGradient)" />
                <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" />

                {/* Point Circles */}
                {points.map((p, idx) => (
                  <g key={idx} className="group/dot cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill="#00d1ff"
                      stroke="#0a0e2c"
                      strokeWidth="2"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="10"
                      fill="#00d1ff"
                      opacity="0"
                      className="hover:opacity-20 transition-opacity duration-150"
                    />
                    <title>{`${p.label}: ${p.count} employees`}</title>
                  </g>
                ))}

                {/* X Axis Labels */}
                {points.map((p, idx) => (
                  <text
                    key={idx}
                    x={p.x}
                    y={lineChartHeight - 8}
                    fill="currentColor"
                    fontSize="9"
                    className="text-gray-400 fill-current opacity-70"
                    textAnchor="middle"
                  >
                    {p.label.split(' ')[0]}
                  </text>
                ))}

                {/* Y Axis Labels */}
                {[maxVal, maxVal / 2, 0].map((val, idx) => {
                  const yVal = padding.top + (idx * 0.5) * (lineChartHeight - padding.top - padding.bottom);
                  return (
                    <text
                      key={idx}
                      x={padding.left - 8}
                      y={yVal + 3}
                      fill="currentColor"
                      fontSize="9"
                      className="text-gray-400 fill-current opacity-70"
                      textAnchor="end"
                    >
                      {Math.round(val)}
                    </text>
                  );
                })}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">No data points yet</div>
            )}
          </div>
        </div>

        {/* Department Distribution Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white font-display">Department Distribution</h3>
            <p className="text-xs text-gray-400">Headcount distribution by department</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-48">
            {/* Doughnut SVG */}
            {doughnutSegments.length > 0 ? (
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {doughnutSegments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx={seg.cx}
                      cy={seg.cy}
                      r={seg.radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="24"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="transition-all duration-300 hover:stroke-[28] cursor-pointer"
                    >
                      <title>{`${seg.name}: ${seg.count} (${seg.percentage}%)`}</title>
                    </circle>
                  ))}
                </svg>
                {/* Center Hole Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold dark:text-white font-display">{activeEmployees}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Staff</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No department data</div>
            )}

            {/* Legends */}
            <div className="flex-1 space-y-2 w-full max-w-[200px]">
              {doughnutSegments.map((seg, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }}></div>
                    <span className="truncate text-gray-600 dark:text-gray-300 font-medium">{seg.name}</span>
                  </div>
                  <span className="text-gray-400 font-mono font-semibold">{seg.count} ({seg.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section: Recent Activity & Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white font-display">Recent Hires</h3>
            <p className="text-xs text-gray-400">Newly recruited personnel details</p>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-accent-cyan flex items-center justify-center font-bold text-sm">
                    {act.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold dark:text-white group-hover:text-accent-cyan transition-colors">
                      {act.full_name}
                    </h4>
                    <p className="text-xs text-gray-400">{act.designation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold font-mono text-gray-500 dark:text-gray-400">{act.employee_id}</p>
                  <p className="text-[10px] text-gray-400">Joined {new Date(act.joining_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}

            {recentActivities.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-500">No recent hiring activity found.</div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white font-display">Quick Operations</h3>
            <p className="text-xs text-gray-400">Common administrative actions</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/employees?action=add"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/10 active:scale-[0.98] transition-all duration-150 text-sm"
            >
              <AddIcon className="w-5 h-5 text-white" />
              Add New Employee
            </Link>

            <Link
              to="/employees"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-150 text-sm"
            >
              <EmployeesIcon className="w-5 h-5" />
              Manage Roster Table
            </Link>

            <div className="h-px bg-gray-100 dark:bg-white/5 my-2"></div>

            <Link
              to="/reports"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-150 text-sm"
            >
              <BuildingIcon className="w-5 h-5" />
              Department Budgets & Analytics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
