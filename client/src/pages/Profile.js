import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Profile() {
  const { currentUser, updateUserProfile } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
    skills: []
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await axios.get('/api/users/profile');
        setProfileData(res.data);
        setEditForm({
          name: res.data.name,
          phone: res.data.phone || '',
          address: res.data.address || '',
          bio: res.data.bio || '',
          skills: res.data.skills || []
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        toast.error('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.put('/api/users/profile', editForm);
      
      // Update local state
      updateUserProfile(res.data);
      setProfileData(res.data);
      
      setIsEditModalOpen(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    }
  };

  const handleSkillChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setEditForm({ ...editForm, skills });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-10">
          <div className="animate-pulse text-gray-500">Loading profile data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div 
        className="md:flex md:items-center md:justify-between mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            My Profile
          </h2>
        </div>
      </motion.div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-primary-500 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-16 w-16 rounded-full ring-4 ring-white"
                src={profileData.avatar}
                alt={profileData.name}
              />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-white">{profileData.name}</h3>
              <p className="text-primary-100">{profileData.position} • {profileData.department}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <motion.div 
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Full Name</span>
                  <span className="text-gray-900 font-medium">{profileData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-900 font-medium">{profileData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role</span>
                  <span className="text-gray-900 font-medium capitalize">{profileData.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Department</span>
                  <span className="text-gray-900 font-medium">{profileData.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Position</span>
                  <span className="text-gray-900 font-medium">{profileData.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Join Date</span>
                  <span className="text-gray-900 font-medium">{format(new Date(profileData.joinDate), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-900 font-medium">{profileData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-900 font-medium">{profileData.phone || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address</span>
                  <span className="text-gray-900 font-medium">{profileData.address || 'Not set'}</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-6 card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-3">About Me</h3>
            <p className="text-gray-600">{profileData.bio || 'No bio provided'}</p>
            
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(profileData.skills || []).map((skill, index) => (
                  <span key={index} className="badge badge-primary py-1 px-2.5">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
          
          <div className="mt-6 flex justify-end">
            <button 
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-primary"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Transition show={isEditModalOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsEditModalOpen(false)}
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
                  Edit Profile
                </Dialog.Title>
                
                <form onSubmit={handleEditSubmit}>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="mt-1 input w-full"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="mt-1 input w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="mt-1 input w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        About Me
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="mt-1 input w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                        Skills (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="skills"
                        name="skills"
                        value={editForm.skills.join(', ')}
                        onChange={handleSkillChange}
                        className="mt-1 input w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Save Changes
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