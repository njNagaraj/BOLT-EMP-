import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements/all');
      setAnnouncements(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/announcements', newAnnouncement);
      setIsModalOpen(false);
      setNewAnnouncement({
        title: '',
        description: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      });
      fetchAnnouncements();
      toast.success('Announcement created successfully');
    } catch (err) {
      console.error('Error creating announcement:', err);
      toast.error('Failed to create announcement');
    }
  };

  const getStatusBadge = (announcement) => {
    const today = new Date().toISOString().split('T')[0];
    if (today < announcement.startDate) {
      return 'badge-warning';
    } else if (today > announcement.endDate) {
      return 'badge-error';
    } else {
      return 'badge-success';
    }
  };

  const getStatusText = (announcement) => {
    const today = new Date().toISOString().split('T')[0];
    if (today < announcement.startDate) {
      return 'Scheduled';
    } else if (today > announcement.endDate) {
      return 'Expired';
    } else {
      return 'Active';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Announcements
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Create Announcement
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-pulse text-gray-500">Loading announcements...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No announcements found.</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 btn btn-primary"
              >
                Create Your First Announcement
              </button>
            </div>
          ) : (
            announcements.map((announcement, idx) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                  <span className={`badge ${getStatusBadge(announcement)}`}>
                    {getStatusText(announcement)}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{announcement.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex space-x-4">
                    <span>Start: {format(new Date(announcement.startDate), 'MMM d, yyyy')}</span>
                    <span>End: {format(new Date(announcement.endDate), 'MMM d, yyyy')}</span>
                  </div>
                  <span>Created: {format(new Date(announcement.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Create Announcement Modal */}
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
                  Create New Announcement
                </Dialog.Title>
                
                <form onSubmit={handleCreateAnnouncement}>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={newAnnouncement.title}
                        onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                        className="mt-1 input w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={newAnnouncement.description}
                        onChange={e => setNewAnnouncement({...newAnnouncement, description: e.target.value})}
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
                          value={newAnnouncement.startDate}
                          onChange={e => setNewAnnouncement({...newAnnouncement, startDate: e.target.value})}
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
                          value={newAnnouncement.endDate}
                          onChange={e => setNewAnnouncement({...newAnnouncement, endDate: e.target.value})}
                          className="mt-1 input w-full"
                          required
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
                      Create Announcement
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