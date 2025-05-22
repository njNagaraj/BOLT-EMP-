import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    checkedIn: 0,
    pendingLeaves: 0,
    activeTasks: 0
  });
  
  const [leaveData, setLeaveData] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  
  const [taskData, setTaskData] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  
  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // Get all users
        const usersRes = await axios.get('/api/users', {
  withCredentials: true
});

        const employees = usersRes.data.filter(user => user.role === 'employee').length;
        
        // Get all attendance
        const attendanceRes = await axios.get('/api/attendance');
        const today = new Date().toISOString().split('T')[0];
        const checkedIn = attendanceRes.data.filter(record => 
          record.date.startsWith(today) && record.checkIn && !record.checkOut
        ).length;
        
        // Get all leaves
        const leavesRes = await axios.get('/api/leaves');
        const pendingLeaves = leavesRes.data.filter(leave => leave.status === 'pending').length;
        const approvedLeaves = leavesRes.data.filter(leave => leave.status === 'approved').length;
        const rejectedLeaves = leavesRes.data.filter(leave => leave.status === 'rejected').length;
        
        // Get all tasks
        const tasksRes = await axios.get('/api/tasks');
        const pendingTasks = tasksRes.data.filter(task => task.status === 'pending').length;
        const inProgressTasks = tasksRes.data.filter(task => task.status === 'in-progress').length;
        const completedTasks = tasksRes.data.filter(task => task.status === 'completed').length;
        const activeTasks = pendingTasks + inProgressTasks;
        
        // Create recent activity from all data
        const allActivity = [
          ...attendanceRes.data.map(record => ({
            type: 'attendance',
            user: usersRes.data.find(user => user.id === record.userId)?.name || 'Unknown',
            action: record.checkOut ? 'checked out' : 'checked in',
            time: record.checkOut || record.checkIn,
            timestamp: new Date(record.checkOut || record.checkIn).getTime()
          })),
          ...leavesRes.data.map(leave => ({
            type: 'leave',
            user: usersRes.data.find(user => user.id === leave.userId)?.name || 'Unknown',
            action: `${leave.status} leave request`,
            time: leave.updatedAt || leave.createdAt,
            timestamp: new Date(leave.updatedAt || leave.createdAt).getTime()
          })),
          ...tasksRes.data.filter(task => task.status === 'completed').map(task => ({
            type: 'task',
            user: usersRes.data.find(user => user.id === task.assignedTo)?.name || 'Unknown',
            action: 'completed task',
            time: task.updatedAt || task.createdAt,
            timestamp: new Date(task.updatedAt || task.createdAt).getTime()
          }))
        ];
        
        // Sort by timestamp (most recent first) and take top 5
        const recent = allActivity
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);
        
        setStats({
          employees,
          checkedIn,
          pendingLeaves,
          activeTasks
        });
        
        setLeaveData({
          pending: pendingLeaves,
          approved: approvedLeaves,
          rejected: rejectedLeaves
        });
        
        setTaskData({
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks
        });
        
        setRecentActivity(recent);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const leaveChartData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [leaveData.pending, leaveData.approved, leaveData.rejected],
        backgroundColor: ['#FF9F0A', '#30D158', '#FF453A'],
        borderWidth: 0,
      },
    ],
  };
  
  const taskChartData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Tasks',
        data: [taskData.pending, taskData.inProgress, taskData.completed],
        backgroundColor: ['#0A84FF', '#FF9F0A', '#30D158'],
      },
    ],
  };
  
  const taskChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Task Status Distribution',
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Admin Dashboard
          </h2>
        </div>
      </div>
      
      {/* Stats overview */}
      <motion.div 
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card bg-primary-500 text-white">
          <div className="text-4xl font-bold">{stats.employees}</div>
          <div className="text-sm font-medium mt-1">Total Employees</div>
        </div>
        <div className="card bg-success-500 text-white">
          <div className="text-4xl font-bold">{stats.checkedIn}</div>
          <div className="text-sm font-medium mt-1">Checked In Today</div>
        </div>
        <div className="card bg-warning-500 text-white">
          <div className="text-4xl font-bold">{stats.pendingLeaves}</div>
          <div className="text-sm font-medium mt-1">Pending Leave Requests</div>
        </div>
        <div className="card bg-gray-700 text-white">
          <div className="text-4xl font-bold">{stats.activeTasks}</div>
          <div className="text-sm font-medium mt-1">Active Tasks</div>
        </div>
      </motion.div>
      
      {/* Charts */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Requests</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={leaveChartData} 
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                cutout: '70%',
              }}
            />
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status</h3>
          <div className="h-64">
            <Bar data={taskChartData} options={taskChartOptions} />
          </div>
        </div>
      </motion.div>
      
      {/* Recent activity */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {recentActivity.map((activity, idx) => (
              <li key={idx}>
                <div className="relative pb-8">
                  {idx !== recentActivity.length - 1 ? (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                        ${activity.type === 'attendance' ? 'bg-success-100 text-success-700' :
                          activity.type === 'leave' ? 'bg-warning-100 text-warning-700' :
                          'bg-primary-100 text-primary-700'}`}
                      >
                        {activity.type === 'attendance' ? '⏰' : 
                         activity.type === 'leave' ? '📆' : '✓'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">{activity.user}</span> {activity.action}
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        {format(new Date(activity.time), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}