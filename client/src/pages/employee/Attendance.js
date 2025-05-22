import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployeeAttendance() {
  const { currentUser } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState({
    isCheckedIn: false,
    checkInTime: null,
    duration: 0,
    location: null
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/attendance');
        
        const userAttendance = res.data.filter(record => record.userId === currentUser.id);
        const sortedAttendance = userAttendance.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = sortedAttendance.find(
          record => record.date.startsWith(today) && record.checkIn && !record.checkOut
        );
        
        let isCheckedIn = false;
        let checkInTime = null;
        let duration = 0;
        let location = null;
        
        if (todayRecord) {
          isCheckedIn = true;
          checkInTime = todayRecord.checkIn;
          duration = differenceInMinutes(new Date(), new Date(checkInTime));
          location = todayRecord.location;
        }
        
        setAttendance(sortedAttendance);
        setCheckInStatus({
          isCheckedIn,
          checkInTime,
          duration,
          location
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
    
    const intervalId = setInterval(() => {
      if (checkInStatus.isCheckedIn) {
        setCheckInStatus(prev => ({
          ...prev,
          duration: differenceInMinutes(new Date(), new Date(prev.checkInTime))
        }));
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [currentUser.id, checkInStatus.isCheckedIn]);
  
  const handleCheckInOut = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          if (checkInStatus.isCheckedIn) {
            const res = await axios.post('/api/attendance/check-out', { location });
            
            setCheckInStatus({
              isCheckedIn: false,
              checkInTime: null,
              duration: 0,
              location: null
            });
            
            setAttendance(prev => 
              prev.map(record => 
                record.id === res.data.id ? res.data : record
              )
            );
            
            toast.success('Checked out successfully');
          } else {
            const res = await axios.post('/api/attendance/check-in', { location });
            
            setCheckInStatus({
              isCheckedIn: true,
              checkInTime: res.data.checkIn,
              duration: 0,
              location: res.data.location
            });
            
            setAttendance(prev => [res.data, ...prev]);
            
            toast.success('Checked in successfully');
          }
        }, () => {
          toast.error('Please enable location access to check in/out');
        });
      } else {
        toast.error('Geolocation is not supported by your browser');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to check in/out');
    }
  };
  
  const calculateDuration = (checkIn, checkOut) => {
    if (!checkOut) return 'In progress';
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const groupByMonth = (records) => {
    return records.reduce((acc, record) => {
      const date = new Date(record.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;
      
      if (!acc[key]) {
        acc[key] = {
          monthName: format(date, 'MMMM yyyy'),
          records: []
        };
      }
      
      acc[key].records.push(record);
      return acc;
    }, {});
  };
  
  const groupedAttendance = groupByMonth(attendance);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            My Attendance
          </h2>
        </div>
      </div>
      
      <motion.div 
        className="card mb-8 border-l-4 border-primary-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Today's Status</h3>
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
            {checkInStatus.location && (
              <p className="mt-1 text-sm text-gray-500">
                Location: {checkInStatus.location.latitude.toFixed(6)}, {checkInStatus.location.longitude.toFixed(6)}
              </p>
            )}
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
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-pulse text-gray-500">Loading attendance history...</div>
        </div>
      ) : (
        <div>
          {attendance.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No attendance records found.</p>
            </div>
          ) : (
            Object.keys(groupedAttendance).map((monthKey, idx) => {
              const month = groupedAttendance[monthKey];
              
              return (
                <motion.div 
                  key={monthKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="mb-8"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {month.monthName}
                  </h3>
                  <div className="overflow-hidden bg-white shadow sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {month.records.map((record) => (
                        <li key={record.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                                </p>
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
                                {record.location && (
                                  <div className="mt-1 text-sm text-gray-500">
                                    <span className="font-medium text-gray-700">Location:</span>{' '}
                                    {record.location.latitude.toFixed(6)}, {record.location.longitude.toFixed(6)}
                                  </div>
                                )}
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
              );
            })
          )}
        </div>
      )}
    </div>
  );
}