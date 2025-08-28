import React, { useEffect, useState, useCallback, useMemo } from 'react';
import VehicleSidebar from '../Components/Layout/VehicleSidebar';
import TopNav from '../Components/Layout/TopNav';
import { ToastContainer, toast } from 'react-toastify';
import { useProfileContext } from '../Context/fetchProfileContext';
import { getAllUsers, addNewUser, updateUser, removeUser } from '../APIS/APIS';
import 'react-toastify/dist/ReactToastify.css';
import { PlusCircle, Trash2, Pencil, X, ChevronDown, ChevronUp, Eye, EyeOff, Loader2 } from 'lucide-react';

// Move PasswordInput outside and memoize properly
const PasswordInput = React.memo(({ name, value, onChange, placeholder, showKey, className = "", showPasswords, setShowPasswords }) => {
  const isVisible = showPasswords[showKey];
  
  const handleToggle = useCallback((e) => {
    e.preventDefault();
    setShowPasswords(prev => ({
      ...prev,
      [showKey]: !prev[showKey]
    }));
  }, [showKey, setShowPasswords]);

  return (
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 ${className}`}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={handleToggle}
        onMouseDown={(e) => e.preventDefault()}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        tabIndex={-1}
      >
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

// Move LoadingButton outside as well
const LoadingButton = React.memo(({ onClick, isLoading, children, className = "", disabled = false, ...props }) => (
  <button
    onClick={onClick}
    disabled={isLoading || disabled}
    className={`flex items-center justify-center gap-2 ${className} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    {...props}
  >
    {isLoading && <Loader2 size={16} className="animate-spin" />}
    {children}
  </button>
));

LoadingButton.displayName = 'LoadingButton';

export default function SettingsPage() {
  const { profile, getProfile } = useProfileContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: '' });
  const [changePassword, setChangePassword] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [editUser, setEditUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState({
    profile: false,
    addUser: false,
    deleteUser: {},
    editUser: false,
    fetchUsers: false
  });

  // Password visibility states
  const [showPasswords, setShowPasswords] = useState({
    // Profile password change
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
    // New user passwords
    newUserPassword: false,
    newUserConfirmPassword: false
  });

  const [settings, setSettings] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    timezone: '',
  });

  useEffect(() => {
    if (!profile || !profile._id) {
      getProfile();
    } else {
      setSettings({
        id: profile._id,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        password: '',
        timezone: '',
      });
    }
  }, [profile, getProfile]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      setIsLoading(prev => ({ ...prev, fetchUsers: true }));
      try {
        const response = await getAllUsers();
        if (response.status === 200) {
          setUsers(response.data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.log(err);
        setUsers([]);
      } finally {
        setIsLoading(prev => ({ ...prev, fetchUsers: false }));
      }
    };
    fetchAllUsers();
  }, []);

  // Memoize callback functions to prevent unnecessary re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNewUserChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setChangePassword((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEditUserChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Memoize setShowPasswords to prevent PasswordInput re-renders
  const memoizedSetShowPasswords = useCallback((updater) => {
    setShowPasswords(updater);
  }, []);

  const addUser = async () => {
    const { name, email, phone, password, confirmPassword, role } = newUser;
    if (name && email && phone && password && confirmPassword && role) {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      setIsLoading(prev => ({ ...prev, addUser: true }));
      try {
        const response = await addNewUser(newUser);
        if (response.status === 200) {
          setUsers((prev) => [...prev, response.data]);
          setNewUser({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: '' });
          setShowAddUserForm(false);
          toast.success('User added successfully');
        } else {
          toast.error(response.error || 'An error occurred. Please try again.');
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Unexpected error';
        toast.error(msg);
      } finally {
        setIsLoading(prev => ({ ...prev, addUser: false }));
      }
    } else {
      toast.error('Please fill all user fields');
    }
  };

  const deleteUser = async (Id) => {
    setIsLoading(prev => ({ ...prev, deleteUser: { ...prev.deleteUser, [Id]: true } }));
    try {
      const response = await removeUser(Id);
      if (response.status === 200) {
        const updatedUsers = users.filter((user) => user._id !== Id);
        setUsers(updatedUsers);
        toast.info('User removed successfully');
      } else {
        toast.error(response.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unexpected error';
      toast.error(msg);
    } finally {
      setIsLoading(prev => ({ 
        ...prev, 
        deleteUser: { ...prev.deleteUser, [Id]: false } 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmNewPassword } = changePassword;
    const updates = {};

    if (settings.name !== profile.name) updates.name = settings.name;
    if (settings.email !== profile.email) updates.email = settings.email;
    if (settings.phone !== profile.phone) updates.phone = settings.phone;
    if (settings.timezone !== profile.timezone) updates.timezone = settings.timezone;

    if ((currentPassword || newPassword || confirmNewPassword) && (!currentPassword || !newPassword || !confirmNewPassword)) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword) {
      updates.password = newPassword;
      updates.currentPassword = currentPassword;
    }

    if (Object.keys(updates).length === 0) {
      toast.info('No changes detected.');
      return;
    }
    updates.id = profile._id;

    setIsLoading(prev => ({ ...prev, profile: true }));
    try {
      const response = await updateUser(updates);
      if (response.status === 200) {
        toast.success('Settings updated successfully!');
        setChangePassword({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } else {
        toast.error(response.data?.message || 'Update failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unexpected error';
      toast.error(msg);
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handleEditSubmit = async () => {
    setIsLoading(prev => ({ ...prev, editUser: true }));
    try {
      const response = await updateUser(editUser);
      if (response.status === 200) {
        toast.success('User updated successfully');
        setEditUser(null);
        const res = await getAllUsers();
        if (res.status === 200) setUsers(res.data);
      } else {
        toast.error(response.error || 'Update failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unexpected error';
      toast.error(msg);
    } finally {
      setIsLoading(prev => ({ ...prev, editUser: false }));
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <ToastContainer position="top-center" autoClose={3000} />
      <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />

      <div className="flex-1 flex flex-col w-full">
        <TopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} className="sticky top-0 z-30 bg-white shadow-md" />
        
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setActiveTab('profile')} 
                  className={`px-4 sm:px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                >
                  Profile Settings
                </button>
                <button 
                  onClick={() => setActiveTab('users')} 
                  className={`px-4 sm:px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                >
                  User Management
                </button>
              </div>
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-3 sm:p-4 md:p-6">
                  <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Profile</h1>
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input 
                          name="name" 
                          value={settings.name} 
                          onChange={handleChange} 
                          required 
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={settings.email} 
                          onChange={handleChange} 
                          required 
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input 
                          type="tel" 
                          name="phone" 
                          value={settings.phone} 
                          onChange={handleChange} 
                          required 
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h2 className="text-lg font-bold mb-3">Change Password</h2>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 md:sr-only">Current Password</label>
                          <PasswordInput
                            name="currentPassword"
                            value={changePassword.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Current Password"
                            showKey="currentPassword"
                            showPasswords={showPasswords}
                            setShowPasswords={memoizedSetShowPasswords}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 md:sr-only">New Password</label>
                          <PasswordInput
                            name="newPassword"
                            value={changePassword.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="New Password"
                            showKey="newPassword"
                            showPasswords={showPasswords}
                            setShowPasswords={memoizedSetShowPasswords}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 md:sr-only">Confirm Password</label>
                          <PasswordInput
                            name="confirmNewPassword"
                            value={changePassword.confirmNewPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm New Password"
                            showKey="confirmNewPassword"
                            showPasswords={showPasswords}
                            setShowPasswords={memoizedSetShowPasswords}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <LoadingButton
                        type="submit"
                        isLoading={isLoading.profile}
                        className="bg-blue-600 text-white py-2 px-4 sm:px-6 rounded hover:bg-blue-700 text-sm font-medium transition duration-150"
                      >
                        {isLoading.profile ? 'Saving...' : 'Save Settings'}
                      </LoadingButton>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                    <h2 className="text-lg sm:text-xl font-bold">User Management</h2>
                    <button 
                      onClick={() => {
                        setShowAddUserForm(!showAddUserForm);
                        setNewUser({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: '' });
                      }} 
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm font-medium transition duration-150"
                    >
                      {showAddUserForm ? <X size={16} /> : <PlusCircle size={16} />} 
                      {showAddUserForm ? 'Cancel' : 'Add User'}
                    </button>
                  </div>
                  
                  {/* Add User Form - Collapsible */}
                  {showAddUserForm && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-md mb-4 border border-gray-200">
                      <h3 className="text-md font-medium mb-3">Add New User</h3>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                            <input 
                              name="name" 
                              value={newUser.name} 
                              onChange={handleNewUserChange} 
                              placeholder="Full Name" 
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                            <input 
                              type="email"
                              name="email" 
                              value={newUser.email} 
                              onChange={handleNewUserChange} 
                              placeholder="Email Address" 
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded" 
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                            <input 
                              type="tel"
                              name="phone" 
                              value={newUser.phone} 
                              onChange={handleNewUserChange} 
                              placeholder="Phone Number" 
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                            <select 
                              name="role" 
                              value={newUser.role} 
                              onChange={handleNewUserChange} 
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                            >
                              <option value="">Select Role</option>
                              <option value="Admin">Admin</option>
                              <option value="Manager">Manager</option>
                              <option value="Staff">Staff</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                            <PasswordInput
                              name="password"
                              value={newUser.password}
                              onChange={handleNewUserChange}
                              placeholder="Password"
                              showKey="newUserPassword"
                              showPasswords={showPasswords}
                              setShowPasswords={memoizedSetShowPasswords}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Confirm Password</label>
                            <PasswordInput
                              name="confirmPassword"
                              value={newUser.confirmPassword}
                              onChange={handleNewUserChange}
                              placeholder="Confirm Password"
                              showKey="newUserConfirmPassword"
                              showPasswords={showPasswords}
                              setShowPasswords={memoizedSetShowPasswords}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <LoadingButton
                          onClick={addUser}
                          isLoading={isLoading.addUser}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium transition duration-150"
                        >
                          {isLoading.addUser ? 'Adding User...' : 'Save User'}
                        </LoadingButton>
                      </div>
                    </div>
                  )}
                  
                  {/* User List */}
                  {isLoading.fetchUsers ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Loading users...</span>
                    </div>
                  ) : users.length > 0 ? (
                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                      <ul className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <li key={user._id} className="px-3 py-2.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50">
                            <div className="mb-2 sm:mb-0">
                              <p className="font-medium text-gray-800">{user.name}</p>
                              <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 gap-2 sm:gap-0">
                                <span className="truncate max-w-xs">{user.email}</span>
                                <span className="hidden sm:inline mx-2">•</span>
                                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{user.role}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              <button 
                                onClick={() => setEditUser(user)} 
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                                aria-label="Edit user"
                              >
                                <Pencil size={16} />
                              </button>
                              <LoadingButton
                                onClick={() => deleteUser(user._id)}
                                isLoading={isLoading.deleteUser[user._id]}
                                disabled={user.role === 'Admin'}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                                aria-label="Delete user"
                              >
                                {isLoading.deleteUser[user._id] ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </LoadingButton>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No users found. Add your first user.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Edit Modal - Full screen on mobile */}
          {editUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-0">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Edit User</h3>
                  <button 
                    onClick={() => setEditUser(null)} 
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                    <input 
                      name="name" 
                      value={editUser.name} 
                      onChange={handleEditUserChange} 
                      placeholder="Name" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <input 
                      type="email"
                      name="email" 
                      value={editUser.email} 
                      onChange={handleEditUserChange} 
                      placeholder="Email" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <input 
                      type="tel"
                      name="phone" 
                      value={editUser.phone} 
                      onChange={handleEditUserChange} 
                      placeholder="Phone" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                    <select 
                      name="role" 
                      value={editUser.role} 
                      onChange={handleEditUserChange} 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                    >
                      <option value="">Select Role</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-2">
                  <button 
                    onClick={() => setEditUser(null)} 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium transition duration-150"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    onClick={handleEditSubmit}
                    isLoading={isLoading.editUser}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium transition duration-150"
                  >
                    {isLoading.editUser ? 'Saving...' : 'Save Changes'}
                  </LoadingButton>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}