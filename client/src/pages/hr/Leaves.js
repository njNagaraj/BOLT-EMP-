import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function HRLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesRes, usersRes] = await Promise.all([
          axios.get('/api/leaves'),
          axios.get('/api/users')
        ]);
        
        setLeaves(leavesRes.data);
        setUsers(usersRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaves data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Find user by ID
  const getUser = (userId) => {
    return users.find(user => user.id === userId);
  };
  
  // Filter leaves
  const filteredLeaves = leaves.filter(leave => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !leave.hrApproved;
    return leave.hrApproved;
  });
  
  // Sort leaves by created date (most recent first)
  const sortedLeaves = [...filteredLeaves].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // Handle HR approval/rejection
  const handleHRAction = async (leaveId, approved, comment = '') => {
    try {
      await axios.put(`/api/leaves/${leaveId}/hr`, { approved, comment });
      
      // Update local state
      setLeaves(leaves.map(leave =>
        leave.id === leaveId ? { 
          ...leave, 
          hrApproved: approved,
          hrComment: comment,
          status: approved ? 'pending' : 'rejected',
          hrUpdatedAt: new Date().toISOString()
        } : leave
      ));
      
      toast.success(`Leave request ${approved ? 'approved' : 'rejected'}`);
    } catch (err) {
      console.error('Error updating leave status:', err);
      toast.error('Failed to update leave status');
    }
  };
  
  // Calculate leave duration in days
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Leave Requests
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
            onClick={() => setFilter('pending')}
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            All
          </button>
        </div>
      </motion.div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-pulse text-gray-500">Loading leave requests...</div>
        </div>
      ) : (
        <div>
          {sortedLeaves.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No leave requests found.</p>
            </div>
          ) : (
            <motion.div 
              className="bg-white shadow overflow-hidden sm:rounded-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="divide-y divide-gray-200">
                {sortedLeaves.map((leave, idx) => {
                  const user = getUser(leave.userId);
                  
                  return (
                    <motion.li 
                      key={leave.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {user && (
                              <div className="flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.avatar}
                                  alt={user.name}
                                />
                              </div>
                            )}
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">{user ? user.name : 'Unknown User'}</p>
                              <p className="text-sm text-gray-500">
                                {user && `${user.department} • ${user.position}`}
                              </p>
                            </div>
                          </div>
                          <div>
                            <span className={`badge ${
                              leave.hrApproved ? 'badge-success' : 
                              leave.hrApproved === false ? 'badge-error' : 
                              'badge-warning'
                            }`}>
                              {leave.hrApproved ? 'HR Approved' : 
                               leave.hrApproved === false ? 'HR Rejected' : 
                               'Pending HR'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Leave Period</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {format(new Date(leave.startDate), 'MMM d, yyyy')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                              <span className="ml-2 text-gray-500">
                                ({calculateDuration(leave.startDate, leave.endDate)} days)
                              </span>
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Reason</h4>
                            <p className="mt-1 text-sm text-gray-900">{leave.reason}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            Requested on {format(new Date(leave.createdAt), 'MMM d, yyyy')}
                          </div>
                          
                          {leave.hrApproved === undefined && (
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleHRAction(leave.id, true, 'Approved by HR')}
                                className="btn btn-success text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleHRAction(leave.id, false, 'Rejected by HR')}
                                className="btn btn-danger text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {leave.hrComment && (
                          <div className="mt-2 text-sm text-gray-500">
                            <span className="font-medium">HR Comment:</span> {leave.hrComment}
                          </div>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}