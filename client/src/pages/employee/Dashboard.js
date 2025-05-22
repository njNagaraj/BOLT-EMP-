import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function EmployeeDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    leaveBalance: 10, // Mock value
    attendancePercentage: 0
  });
  
  const [checkInStatus, setCheckInStatus] = useState({
    isCheckedIn: false,
    checkInTime: null,
    duration: 0
  });
  
  const [tasksByStatus, setTasksByStatus] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get tasks
        const tasksRes = await axios.get('/api/tasks');
        const userTasks = tasksRes.data.filter(task => task.assignedTo === currentUser.id);
        
        const pendingTasks = userTasks.filter(task => task.status === 'pending').length;
        const inProgressTasks = userTasks.filter(task => task.status === 'in-progress').length;
        const completedTasks = userTasks.filter(task => task.status === 'completed').length;
        
        // Get attendance
        const attendanceRes = await axios.get('/api/attendance');
        const userAttendance = attendanceRes.data.filter(record => record.userId === currentUser.id);
        
        // Check if currently checked in
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = userAttendance.find(
          record => record.date.startsWith(today) && record.checkIn && !record.checkOut
        );
        
        let isCheckedIn = false;
        let checkInTime = null;
        let duration = 0;
        
        if (todayRecord) {
          isCheckedIn = true;
          checkInTime = todayRecord.checkIn;
          duration = differenceInMinutes(new Date(), new Date(checkInTime));
        }
        
        // Calculate attendance percentage (mock calculation for demo)
        const workDays = 20; // Assume 20 work days per month
        const daysAttended = userAttendance.length;
        const attendancePercentage = Math.round((daysAttended / workDays) * 100);
        
        // Get leaves
        const leavesRes = await axios.get('/api/leaves');
        const userLeaves = leavesRes.data.filter(leave => leave.userId === currentUser.id);
        
        // Create recent activity
        const allActivity = [
          ...userAttendance.map(record => ({
            type: 'attendance',
            action: record.checkOut ? 'checked out' : 'checked in',
            time: record.checkOut || record.checkIn,
            timestamp: new Date(record.checkOut || record.checkIn).getTime()
          })),
          ...userLeaves.map(leave => ({
            type: 'leave',
            action: `leave request ${leave.status}`,
            time: leave.updatedAt || leave.createdAt,
            timestamp: new Date(leave.updatedAt || leave.createdAt).getTime()
          })),
          ...userTasks.filter(task => task.status === 'completed').map(task => ({
            type: 'task',
            action: `completed task: ${task.title}`,
            time: task.updatedAt || task.createdAt,
            timestamp: new Date(task.updatedAt || task.createdAt).getTime()
          }))
        ];
        
        // Sort by timestamp (most recent first) and take top 5
        const recent = allActivity
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);
        
        setStats({
          pendingTasks: pendingTasks + inProgressTasks,
          completedTasks,
          leaveBalance: 10, // Mock value
          attendancePercentage
        });
        
        setTasksByStatus({
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks
        });
        
        setCheckInStatus({
          isCheckedIn,
          checkInTime,
          duration
        });
        
        setRecentActivity(recent);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up interval to update duration if checked in
    const intervalId = setInterval(() => {
      if (checkInStatus.isCheckedIn) {
        setCheckInStatus(prev => ({
          ...prev,
          duration: differenceInMinutes(new Date(), new Date(prev.checkInTime))
        }));
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [currentUser.id, checkInStatus.isCheckedIn]);
  
  const handleCheckInOut = async () => {
    try {
      if (checkInStatus.isCheckedIn) {
        // Check out
        await axios.post('/api/attendance/check-out');
        
        setCheckInStatus({
          isCheckedIn: false,
          checkInTime: null,
          duration: 0
        });
        
        toast.success('Checked out successfully');
      } else {
        // Check in
        const res = await axios.post('/api/attendance/check-in');
        
        setCheckInStatus({
          isCheckedIn: true,
          checkInTime: res.data.checkIn,
          duration: 0
        });
        
        toast.success('Checked in successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to check in/out');
    }
  };
  
  const taskChartData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [tasksByStatus.pending, tasksByStatus.inProgress, tasksByStatus.completed],
        backgroundColor: ['#0A84FF', '#FF9F0A', '#30D158'],
        borderWidth: 0,
      },
    ],
  };
  
  // Format duration in hours and minutes
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome, {currentUser.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-pulse text-gray-500">Loading dashboard...</div>
        </div>
      ) : (
        <>
          {/* Check in/out card */}
          <motion.div 
            className="card mb-8 border-l-4 border-primary-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Attendance Status</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {checkInStatus.isCheckedIn ? (
                    <>
                      You checked in at {format(parseISO(checkInStatus.checkInTime), 'h:mm a')}
                      <span className="ml-2 text-primary-600">
                        (Duration: {formatDuration(checkInStatus.duration)})
                      </span>
                    </>
                  ) : (
                    'You have not checked in today'
                  )}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={handleCheckInOut}
                  className={`btn ${checkInStatus.isCheckedIn ? 'btn-outline' : 'btn-primary'}`}
                >
                  {checkInStatus.isCheckedIn ? 'Check Out' : 'Check In'}
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Stats overview */}
          <motion.div 
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="card bg-primary-500 text-white">
              <div className="text-4xl font-bold">{stats.pendingTasks}</div>
              <div className="text-sm font-medium mt-1">Pending Tasks</div>
            </div>
            <div className="card bg-success-500 text-white">
              <div className="text-4xl font-bold">{stats.completedTasks}</div>
              <div className="text-sm font-medium mt-1">Completed Tasks</div>
            </div>
            <div className="card bg-warning-500 text-white">
              <div className="text-4xl font-bold">{stats.leaveBalance}</div>
              <div className="text-sm font-medium mt-1">Leave Balance</div>
            </div>
            <div className="card bg-gray-700 text-white">
              <div className="text-4xl font-bold">{stats.attendancePercentage}%</div>
              <div className="text-sm font-medium mt-1">Attendance Rate</div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Task Overview Chart */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Task Overview</h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut 
                  data={taskChartData} 
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
            </motion.div>
            
            {/* Recent Activity */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="flow-root">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
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
                                  You {activity.action}
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
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}