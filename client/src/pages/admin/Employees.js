import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    position: '',
    role: 'employee'
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/users');
        const employeesList = res.data.filter(user => user.role === 'employee');
        setEmployees(employeesList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employees data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchEmployeeTasks = async (employeeId) => {
    try {
      const res = await axios.get(`/api/tasks?assignedTo=${employeeId}`);
      setEmployeeTasks(res.data);
    } catch (err) {
      console.error('Error fetching employee tasks:', err);
      toast.error('Failed to fetch employee tasks');
    }
  };
  
  const departments = ['all', ...new Set(employees.map(emp => emp.department))];
  
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(search.toLowerCase()) ||
                         employee.email.toLowerCase().includes(search.toLowerCase()) ||
                         employee.position.toLowerCase().includes(search.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });
  
  const sortedEmployees = [...filteredEmployees].sort((a, b) => a.name.localeCompare(b.name));

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.post('/api/users', newEmployee);
      setEmployees([...employees, res.data]);
      setIsModalOpen(false);
      setNewEmployee({
        name: '',
        email: '',
        password: '',
        department: '',
        position: '',
        role: 'employee'
      });
      toast.success('Employee added successfully');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add employee');
    }
  };

  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setIsProfileModalOpen(true);
  };

  const handleViewTasks = async (employee) => {
    setSelectedEmployee(employee);
    await fetchEmployeeTasks(employee.id);
    setIsTasksModalOpen(true);
  };

  const getTaskStatusBadge = (status) => {
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
            Employees
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Add Employee
          </button>
        </div>
      </div>
      
      <motion.div 
        className="mb-6 bg-white p-4 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sm:flex sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="search" className="sr-only">
              Search employees
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                name="search"
                id="search"
                className="input w-full"
                placeholder="Search employees..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="department" className="text-sm font-medium text-gray-700">
              Department:
            </label>
            <select
              id="department"
              name="department"
              className="input text-sm"
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-pulse text-gray-500">Loading employees...</div>
        </div>
      ) : (
        <div>
          {sortedEmployees.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No employees found.</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 btn btn-primary"
              >
                Add Your First Employee
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedEmployees.map((employee, idx) => (
                <motion.div 
                  key={employee.id}
                  className="card hover:shadow-md transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-16 w-16 rounded-full"
                        src={employee.avatar}
                        alt={employee.name}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.position}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 gap-1 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Department:</span>
                      <span className="text-gray-900">{employee.department}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Email:</span>
                      <span className="text-gray-900">{employee.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Join Date:</span>
                      <span className="text-gray-900">{format(new Date(employee.joinDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex space-x-3">
                    <button 
                      onClick={() => handleViewTasks(employee)}
                      className="btn btn-outline btn-sm flex-1"
                    >
                      View Tasks
                    </button>
                    <button 
                      onClick={() => handleViewProfile(employee)}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      View Profile
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Employee Modal */}
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
                  Add New Employee
                </Dialog.Title>
                
                <form onSubmit={handleAddEmployee}>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newEmployee.name}
                        onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                        className="mt-1 input w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={newEmployee.email}
                        onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                        className="mt-1 input w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password *
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={newEmployee.password}
                        onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                        className="mt-1 input w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                        Department *
                      </label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={newEmployee.department}
                        onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                        className="mt-1 input w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                        Position *
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={newEmployee.position}
                        onChange={e => setNewEmployee({...newEmployee, position: e.target.value})}
                        className="mt-1 input w-full"
                        required
                      />
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
                      Add Employee
                    </button>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* View Profile Modal */}
      <Transition show={isProfileModalOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsProfileModalOpen(false)}
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

            <span className="inline-block h-screen align-middle" aria-hidden="true">
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
              <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                {selectedEmployee && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                        Employee Profile
                      </Dialog.Title>
                      <button
                        onClick={() => setIsProfileModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Close</span>
                        ×
                      </button>
                    </div>

                    <div className="flex items-center mb-6">
                      <img
                        src={selectedEmployee.avatar}
                        alt={selectedEmployee.name}
                        className="h-20 w-20 rounded-full"
                      />
                      <div className="ml-4">
                        <h4 className="text-xl font-medium text-gray-900">{selectedEmployee.name}</h4>
                        <p className="text-gray-500">{selectedEmployee.position}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h5>
                        <div className="space-y-2">
                          <p><span className="font-medium">Email:</span> {selectedEmployee.email}</p>
                          <p><span className="font-medium">Department:</span> {selectedEmployee.department}</p>
                          <p><span className="font-medium">Position:</span> {selectedEmployee.position}</p>
                          <p><span className="font-medium">Join Date:</span> {format(new Date(selectedEmployee.joinDate), 'MMMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-500 mb-2">Work Information</h5>
                        <div className="space-y-2">
                          <p><span className="font-medium">Employee ID:</span> {selectedEmployee.id}</p>
                          <p><span className="font-medium">Role:</span> {selectedEmployee.role}</p>
                          <p><span className="font-medium">Status:</span> <span className="badge badge-success">Active</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(false);
                          handleViewTasks(selectedEmployee);
                        }}
                        className="btn btn-primary"
                      >
                        View Tasks
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* View Tasks Modal */}
      <Transition show={isTasksModalOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsTasksModalOpen(false)}
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

            <span className="inline-block h-screen align-middle" aria-hidden="true">
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
              <div className="inline-block w-full max-w-3xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                {selectedEmployee && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                        Tasks for {selectedEmployee.name}
                      </Dialog.Title>
                      <button
                        onClick={() => setIsTasksModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Close</span>
                        ×
                      </button>
                    </div>

                    {employeeTasks.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No tasks assigned to this employee.</p>
                    ) : (
                      <div className="space-y-4">
                        {employeeTasks.map(task => (
                          <div key={task.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                                <p className="text-gray-500 mt-1">{task.description}</p>
                              </div>
                              <span className={`badge ${getTaskStatusBadge(task.status)}`}>
                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                              <div>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</div>
                              <div>Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}