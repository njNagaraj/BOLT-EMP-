import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployeeTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/tasks');
        
        // Filter user's tasks
        const userTasks = res.data.filter(task => task.assignedTo === currentUser.id);
        
        // Sort by due date (closest first)
        const sortedTasks = userTasks.sort((a, b) => 
          new Date(a.dueDate) - new Date(b.dueDate)
        );
        
        setTasks(sortedTasks);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser.id]);
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });
  
  // Handle task update
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      
      // Update task in the list
      setTasks(tasks.map(task => 
        task.id === taskId ? res.data : task
      ));
      
      toast.success(`Task marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating task status:', err);
      toast.error('Failed to update task');
    }
  };
  
  // Get priority badge color
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'badge-error';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-primary';
      default:
        return 'badge-gray';
    }
  };
  
  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'in-progress':
        return 'badge-warning';
      case 'pending':
        return 'badge-gray';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            My Tasks
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
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`btn ${filter === 'in-progress' ? 'btn-primary' : 'btn-outline'}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
          >
            Completed
          </button>
        </div>
      </motion.div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-pulse text-gray-500">Loading tasks...</div>
        </div>
      ) : (
        <div>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No tasks found.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {filteredTasks.map((task, idx) => {
                const dueDate = new Date(task.dueDate);
                const isPastDue = dueDate < new Date() && task.status !== 'completed';
                
                return (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="card hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className={`badge ${getStatusBadge(task.status)}`}>
                            {task.status === 'in-progress' ? 'In Progress' : 
                              task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                          <span className={`badge ${getPriorityBadge(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                          </span>
                          {isPastDue && (
                            <span className="badge badge-error">
                              Past Due
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={isPastDue ? 'text-error-600 font-medium' : 'text-gray-500'}>
                        Due: {format(dueDate, 'MMM d, yyyy')}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-gray-600">{task.description}</p>
                    </div>
                    
                    <div className="mt-5 flex justify-end space-x-3">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'in-progress')}
                          className="btn btn-primary btn-sm"
                        >
                          Start Task
                        </button>
                      )}
                      
                      {task.status === 'in-progress' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'completed')}
                          className="btn btn-success btn-sm"
                        >
                          Mark Completed
                        </button>
                      )}
                      
                      {task.status === 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'in-progress')}
                          className="btn btn-outline btn-sm"
                        >
                          Reopen Task
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}