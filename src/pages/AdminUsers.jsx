import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, banUser, unbanUser, deleteUser } from '../api/adminApi';
import Sidebar from '../components/Sidebar';
import styles from '../styles/AdminUsers.module.css';

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
    <div className={styles.usersPage}>
      <Sidebar active="users" />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Users Management</h1>
          <p>Manage and moderate user accounts</p>
        </header>

        <div className={styles.controls}>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            <button className={filter === 'all' ? styles.active : ''} onClick={() => setFilter('all')}>All</button>
            <button className={filter === 'active' ? styles.active : ''} onClick={() => setFilter('active')}>Active</button>
            <button className={filter === 'inactive' ? styles.active : ''} onClick={() => setFilter('inactive')}>Banned</button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading users...</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
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
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.username}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.status} ${user.isActive ? styles.active : styles.banned}`}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td>{user.savedRecipesCount || 0}</td>
                    <td>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div className={styles.actions}>
                        {user.isActive ? (
                          <button className={styles.ban} onClick={() => handleBan(user.id)}>Ban</button>
                        ) : (
                          <button className={styles.unban} onClick={() => handleUnban(user.id)}>Unban</button>
                        )}
                        <button className={styles.delete} onClick={() => handleDelete(user.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;