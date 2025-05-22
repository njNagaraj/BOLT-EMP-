import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, usersRes] = await Promise.all([
          axios.get('/api/tasks'),
          axios.get('/api/users')
        ]);
        
        setTasks(tasksRes.data);
        setUsers(usersRes.data.filter(user => user.role === 'employee'));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Find user by ID
  const getUser = (userId) => {
    return users.find(user => user.id === userId);
  };
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filter === 'all' || task.status === filter;
    const matchesEmployee = employeeFilter === 'all' || task.assignedTo === employeeFilter;
    return matchesStatus && matchesEmployee;
  });
  
  // Sort tasks by due date (closest first)
  const sortedTasks = [...filteredTasks].sort((a, b) => 
    new Date(a.dueDate) - new Date(b.dueDate)
  );
  
  // Handle task creation
  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title || !newTask.assignedTo) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      const res = await axios.post('/api/tasks', newTask);
      
      // Update local state
      setTasks([...tasks, res.data]);
      setIsModalOpen(false);
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      });
      
      toast.success('Task created successfully');
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task');
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
            Tasks
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Create Task
          </button>
        </div>
      </div>
      
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
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
          
          <div className="flex items-center space-x-2">
            <label htmlFor="employeeFilter" className="text-sm font-medium text-gray-700">
              Employee:
            </label>
            <select
              id="employeeFilter"
              className="input text-sm"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <option value="all">All Employees</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-pulse text-gray-500">Loading tasks...</div>
        </div>
      ) : (
        <div>
          {sortedTasks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No tasks found.</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 btn btn-primary"
              >
                Create Your First Task
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {sortedTasks.map((task, idx) => {
                const dueDate = new Date(task.dueDate);
                const isPastDue = dueDate < new Date() && task.status !== 'completed';
                const assignedUser = getUser(task.assignedTo);
                
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

                    <div className="mt-4 flex items-center justify-between">
                      {assignedUser && (
                        <div className="flex items-center">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={assignedUser.avatar}
                            alt={assignedUser.name}
                          />
                          <span className="ml-2 text-sm text-gray-500">
                            Assigned to: {assignedUser.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      )}
      
      {/* Create Task Modal */}
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
                  Create New Task
                </Dialog.Title>
                
                <form onSubmit={handleCreateTask}>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={newTask.title}
                        onChange={e => setNewTask({...newTask, title: e.target.value})}
                        className="mt-1 input w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={newTask.description}
                        onChange={e => setNewTask({...newTask, description: e.target.value})}
                        rows={3}
                        className="mt-1 input w-full"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                        Assign To *
                      </label>
                      <select
                        id="assignedTo"
                        name="assignedTo"
                        value={newTask.assignedTo}
                        onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                        className="mt-1 input w-full"
                        required
                      >
                        <option value="" disabled>Select employee</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.department})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                          Priority
                        </label>
                        <select
                          id="priority"
                          name="priority"
                          value={newTask.priority}
                          onChange={e => setNewTask({...newTask, priority: e.target.value})}
                          className="mt-1 input w-full"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                          Due Date
                        </label>
                        <input
                          type="date"
                          id="dueDate"
                          name="dueDate"
                          value={newTask.dueDate}
                          onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                          className="mt-1 input w-full"
                        />
                      </div>
                    </div>
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
                      Create Task
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