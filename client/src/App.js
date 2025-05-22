import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Components
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import EmployeeDashboard from './pages/employee/Dashboard';
import Layout from './components/Layout';
import Attendance from './pages/admin/Attendance';
import Leaves from './pages/admin/Leaves';
import Tasks from './pages/admin/Tasks';
import Employees from './pages/admin/Employees';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeLeaves from './pages/employee/Leaves';
import EmployeeTasks from './pages/employee/Tasks';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

function App() {
  const { currentUser, isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute 
            element={<Layout />} 
            allowedRoles={['admin']} 
          />
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="employees" element={<Employees />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Employee Routes */}
      <Route 
        path="/employee" 
        element={
          <ProtectedRoute 
            element={<Layout />} 
            allowedRoles={['employee']} 
          />
        }
      >
        <Route index element={<EmployeeDashboard />} />
        <Route path="attendance" element={<EmployeeAttendance />} />
        <Route path="leaves" element={<EmployeeLeaves />} />
        <Route path="tasks" element={<EmployeeTasks />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Root redirect based on role */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            currentUser.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/employee" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;