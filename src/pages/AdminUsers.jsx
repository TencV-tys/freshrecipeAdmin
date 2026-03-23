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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(filter);
      // Filter out admin users - only show regular users
      const regularUsers = data.filter(user => user.role !== 'admin');
      setUsers(regularUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setShowModal(true);
    setModalLoading(true);
    try {
      const details = await getUserDetails(user.id);
      setSelectedUser(details);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleWarn = async (reason) => {
    setActionLoading(true);
    try {
      await warnUser(selectedUser.id, { reason });
      fetchUsers();
      setShowModal(false);
      alert('Warning sent successfully');
    } catch (error) {
      console.error('Failed to warn user:', error);
      alert('Failed to send warning');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async (reason) => {
    setActionLoading(true);
    try {
      await banUser(selectedUser.id, { reason });
      fetchUsers();
      setShowModal(false);
      alert('User banned successfully');
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (reason, days) => {
    setActionLoading(true);
    try {
      await suspendUser(selectedUser.id, { reason, durationDays: days });
      fetchUsers();
      setShowModal(false);
      alert('User suspended successfully');
    } catch (error) {
      console.error('Failed to suspend user:', error);
      alert('Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      await restoreUser(selectedUser.id);
      fetchUsers();
      setShowModal(false);
      alert('User restored successfully');
    } catch (error) {
      console.error('Failed to restore user:', error);
      alert('Failed to restore user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteUser(selectedUser.id);
      fetchUsers();
      setShowModal(false);
      alert('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
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
                {filteredUsers.map(user => (
                  <tr key={user.id} className="clickable-row">
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
                ))}
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