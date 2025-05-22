import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, usersRes] = await Promise.all([
          axios.get('/api/attendance'),
          axios.get('/api/users')
        ]);
        
        setAttendance(attendanceRes.data);
        setUsers(usersRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Group attendance records by date
  const groupedAttendance = attendance.reduce((acc, record) => {
    const date = record.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {});
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedAttendance).sort((a, b) => new Date(b) - new Date(a));
  
  // Calculate work duration
  const calculateDuration = (checkIn, checkOut) => {
    if (!checkOut) return 'In progress';
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };
  
  // Find user name by ID
  const getUserName = (userId) => {
    const user = users.find(user => user.id === userId);
    return user ? user.name : 'Unknown';
  };
  
  // Filter attendance records
  const filteredDates = sortedDates.filter(date => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      return date === new Date().toISOString().split('T')[0];
    }
    if (filter === 'week') {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      return new Date(date) >= weekAgo;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Attendance Records
          </h2>
        </div>
      </div>
      
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`btn ${filter === 'week' ? 'btn-primary' : 'btn-outline'}`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`btn ${filter === 'today' ? 'btn-primary' : 'btn-outline'}`}
          >
            Today
          </button>
        </div>
      </motion.div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-pulse text-gray-500">Loading attendance records...</div>
        </div>
      ) : (
        <div>
          {filteredDates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No attendance records found.</p>
            </div>
          ) : (
            filteredDates.map((date, idx) => (
              <motion.div 
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="mb-8"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </h3>
                <div className="overflow-hidden bg-white shadow sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {groupedAttendance[date].map((record) => (
                      <li key={record.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                                  {getUserName(record.userId).charAt(0)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <p className="font-medium text-gray-900">{getUserName(record.userId)}</p>
                                <div className="flex space-x-4 mt-1 text-sm text-gray-500">
                                  <div>
                                    <span className="font-medium text-gray-700">Check-in:</span>{' '}
                                    {format(new Date(record.checkIn), 'h:mm a')}
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Check-out:</span>{' '}
                                    {record.checkOut ? format(new Date(record.checkOut), 'h:mm a') : 'Not checked out'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className={`badge ${record.checkOut ? 'badge-success' : 'badge-warning'}`}>
                                {record.checkOut ? calculateDuration(record.checkIn, record.checkOut) : 'Active'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}