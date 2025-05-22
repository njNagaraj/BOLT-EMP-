import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployeeLeaves() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    reason: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/leaves');
        
        // Filter user's leave records
        const userLeaves = res.data.filter(leave => leave.userId === currentUser.id);
        
        // Sort by created date (most recent first)
        const sortedLeaves = userLeaves.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setLeaves(sortedLeaves);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaves data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser.id]);
  
  // Handle leave application
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    
    // Validate dates
    const start = new Date(newLeave.startDate);
    const end = new Date(newLeave.endDate);
    
    if (end < start) {
      toast.error('End date cannot be before start date');
      return;
    }
    
    try {
      const res = await axios.post('/api/leaves', newLeave);
      
      // Add new leave to the list
      setLeaves([res.data, ...leaves]);
      
      // Close modal and reset form
      setIsModalOpen(false);
      setNewLeave({
        reason: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      });
      
      toast.success('Leave application submitted successfully');
    } catch (err) {
      console.error('Error applying for leave:', err);
      toast.error('Failed to submit leave application');
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
  
  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'badge-success';
      case 'rejected':
        return 'badge-error';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            My Leave Applications
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Apply for Leave
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-pulse text-gray-500">Loading leave history...</div>
        </div>
      ) : (
        <div>
          {leaves.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No leave applications found.</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 btn btn-primary"
              >
                Apply for Your First Leave
              </button>
            </div>
          ) : (
            <motion.div 
              className="bg-white shadow overflow-hidden sm:rounded-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="divide-y divide-gray-200">
                {leaves.map((leave, idx) => (
                  <motion.li 
                    key={leave.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className={`badge ${getStatusBadge(leave.status)}`}>
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              Applied on {format(new Date(leave.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-900">
                            <span className="font-medium">Reason:</span> {leave.reason}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="mr-1.5 text-gray-900 font-medium">From:</span>
                            {format(new Date(leave.startDate), 'MMM d, yyyy')}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <span className="mr-1.5 text-gray-900 font-medium">To:</span>
                            {format(new Date(leave.endDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            <span className="font-medium">{calculateDuration(leave.startDate, leave.endDate)}</span> day(s)
                          </p>
                        </div>
                      </div>
                      
                      {leave.updatedAt && (
                        <div className="mt-2 text-sm text-gray-500">
                          <p>
                            <span className="font-medium">Updated:</span> {format(new Date(leave.updatedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      )}
      
      {/* Apply for leave modal */}
      <Transition show={isModalOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Apply for Leave
                </Dialog.Title>
                
                <form onSubmit={handleApplyLeave}>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                        Reason for Leave *
                      </label>
                      <textarea
                        id="reason"
                        name="reason"
                        rows={3}
                        value={newLeave.reason}
                        onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                        className="mt-1 input w-full"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={newLeave.startDate}
                          onChange={e => setNewLeave({...newLeave, startDate: e.target.value})}
                          className="mt-1 input w-full"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                          End Date *
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={newLeave.endDate}
                          onChange={e => setNewLeave({...newLeave, endDate: e.target.value})}
                          className="mt-1 input w-full"
                          required
                        />
                      </div>
                    </div>
                    
                    {newLeave.startDate && newLeave.endDate && (
                      <div className="text-sm text-gray-600">
                        Duration: {calculateDuration(newLeave.startDate, newLeave.endDate)} day(s)
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}