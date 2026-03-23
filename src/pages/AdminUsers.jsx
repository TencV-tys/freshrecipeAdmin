import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, banUser, unbanUser, deleteUser } from '../api/adminApi';
import '../styles/AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(filter);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBan = async (userId) => {
    if (window.confirm('Ban this user?')) {
      await banUser(userId);
      fetchUsers();
    }
  };

  const handleUnban = async (userId) => {
    await unbanUser(userId);
    fetchUsers();
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Delete this user permanently?')) {
      await deleteUser(userId);
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-users">
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
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
          <button className={filter === 'inactive' ? 'active' : ''} onClick={() => setFilter('inactive')}>Banned</button>
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
                <th>Saved Recipes</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`user-status ${user.isActive ? 'active' : 'banned'}`}>
                      {user.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td>{user.savedRecipesCount || 0}</td>
                  <td>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="user-actions">
                      {user.isActive ? (
                        <button className="btn-ban" onClick={() => handleBan(user.id)}>Ban</button>
                      ) : (
                        <button className="btn-unban" onClick={() => handleUnban(user.id)}>Unban</button>
                      )}
                      <button className="btn-delete" onClick={() => handleDelete(user.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;