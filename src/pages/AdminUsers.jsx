import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, banUser, suspendUser, restoreUser, deleteUser, warnUser, getUserDetails } from '../api/adminApi';
import UserModal from '../components/UserModal';
import '../styles/AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Helper function to get user ID from different possible field names
  const getUserId = (user) => {
    if (!user) return null;
    // Try different possible ID field names
    return user._id || user.id || user.userId || user.ID || null;
  };

  const fetchUsers = useCallback(async () => {
    console.log('📖 Fetching users with filter:', filter);
    setLoading(true);
    try {
      const data = await getUsers(filter);
      console.log('✅ RAW Users fetched:', data);
      if (data && data.length > 0) {
        console.log('📊 First user object keys:', Object.keys(data[0]));
        console.log('📊 First user full object:', data[0]);
        console.log('🔑 ID field value:', data[0]?.id);
        console.log('🔑 _id field value:', data[0]?._id);
        console.log('🔑 userId field value:', data[0]?.userId);
      }
      
      // Filter out admin users
      const regularUsers = data.filter(user => user.role !== 'admin');
      console.log('📊 Regular users (non-admin):', regularUsers.length);
      setUsers(regularUsers);
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewUser = async (user) => {
    const userId = getUserId(user);
    console.log('👁️ Viewing user details for:', user.username, 'ID:', userId);
    
    if (!userId) {
      console.error('❌ No user ID found for:', user);
      console.log('Available fields:', Object.keys(user));
      alert('Error: Unable to get user ID. Please check console for details.');
      return;
    }
    
    setSelectedUser(user);
    setShowModal(true);
    setModalLoading(true);
    try {
      console.log('📡 Fetching user details from API for ID:', userId);
      const details = await getUserDetails(userId);
      console.log('✅ User details fetched:', details);
      setSelectedUser(details);
    } catch (error) {
      console.error('❌ Failed to fetch user details:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to load user details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleWarn = async (reason) => {
    const userId = getUserId(selectedUser);
    if (!userId) {
      console.error('❌ Cannot warn: No user ID');
      alert('Error: User ID not found');
      return;
    }
    
    console.log('⚠️ Warning user:', selectedUser?.username, 'ID:', userId, 'Reason:', reason);
    setActionLoading(true);
    try {
      const result = await warnUser(userId, { reason });
      console.log('✅ Warning sent:', result);
      await fetchUsers();
      setShowModal(false);
      alert('Warning sent successfully');
    } catch (error) {
      console.error('❌ Failed to warn user:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to send warning');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async (reason) => {
    const userId = getUserId(selectedUser);
    if (!userId) {
      console.error('❌ Cannot ban: No user ID');
      alert('Error: User ID not found');
      return;
    }
    
    console.log('🚫 Banning user:', selectedUser?.username, 'ID:', userId, 'Reason:', reason);
    setActionLoading(true);
    try {
      const result = await banUser(userId, { reason });
      console.log('✅ User banned:', result);
      await fetchUsers();
      setShowModal(false);
      alert('User banned successfully');
    } catch (error) {
      console.error('❌ Failed to ban user:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to ban user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (reason, days) => {
    const userId = getUserId(selectedUser);
    if (!userId) {
      console.error('❌ Cannot suspend: No user ID');
      alert('Error: User ID not found');
      return;
    }
    
    console.log('⏰ Suspending user:', selectedUser?.username, 'ID:', userId, 'Days:', days, 'Reason:', reason);
    setActionLoading(true);
    try {
      const result = await suspendUser(userId, { reason, durationDays: days });
      console.log('✅ User suspended:', result);
      await fetchUsers();
      setShowModal(false);
      alert('User suspended successfully');
    } catch (error) {
      console.error('❌ Failed to suspend user:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    const userId = getUserId(selectedUser);
    if (!userId) {
      console.error('❌ Cannot restore: No user ID');
      alert('Error: User ID not found');
      return;
    }
    
    console.log('🔄 Restoring user:', selectedUser?.username, 'ID:', userId);
    setActionLoading(true);
    try {
      const result = await restoreUser(userId);
      console.log('✅ User restored:', result);
      await fetchUsers();
      setShowModal(false);
      alert('User restored successfully');
    } catch (error) {
      console.error('❌ Failed to restore user:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to restore user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    const userId = getUserId(selectedUser);
    if (!userId) {
      console.error('❌ Cannot delete: No user ID');
      alert('Error: User ID not found');
      return;
    }
    
    console.log('🗑️ Deleting user:', selectedUser?.username, 'ID:', userId);
    setActionLoading(true);
    try {
      const result = await deleteUser(userId);
      console.log('✅ User deleted:', result);
      await fetchUsers();
      setShowModal(false);
      alert('User deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-users">
      <div className="users-main">
        <header className="users-header">
          <h1>Users Management</h1>
          <p>Manage and moderate user accounts</p>
        </header>

        <div className="users-controls">
          <div className="users-search">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="users-filters">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All Users</button>
            <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
            <button className={filter === 'suspended' ? 'active' : ''} onClick={() => setFilter('suspended')}>Suspended</button>
            <button className={filter === 'banned' ? 'active' : ''} onClick={() => setFilter('banned')}>Banned</button>
          </div>
        </div>

        {loading ? (
          <div className="users-loading">Loading users...</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Saved</th>
                  <th>Violations</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const userId = getUserId(user);
                  return (
                    <tr key={userId || Math.random()} className="clickable-row">
                      <td onClick={() => handleViewUser(user)}>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.username} className="avatar-image" />
                            ) : (
                              <div className="avatar-placeholder">
                                {user.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span>{user.username}</span>
                        </div>
                      </td>
                      <td onClick={() => handleViewUser(user)}>{user.email}</td>
                      <td onClick={() => handleViewUser(user)}>
                        <span className={`user-status ${user.status}`}>
                          {user.status === 'active' ? '✅ Active' : user.status === 'suspended' ? '⏰ Suspended' : '🚫 Banned'}
                        </span>
                      </td>
                      <td onClick={() => handleViewUser(user)}>{user.savedRecipesCount || 0}</td>
                      <td onClick={() => handleViewUser(user)}>{user.violationCount || 0}</td>
                      <td onClick={() => handleViewUser(user)}>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button className="view-btn" onClick={(e) => { e.stopPropagation(); handleViewUser(user); }}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onWarn={handleWarn}
          onBan={handleBan}
          onSuspend={handleSuspend}
          onRestore={handleRestore}
          onDelete={handleDelete}
          loading={actionLoading || modalLoading}
        />
      )}
    </div>
  );
};

export default AdminUsers;