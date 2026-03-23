import React, { useState, useEffect } from 'react';
import { getStats } from '../api/adminApi';
import StatsCard from '../components/StatsCard';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    usersActiveToday: 0,
    mostViewedRecipes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      <div className="dashboard-stats">
        <StatsCard title="Total Users" value={stats.totalUsers} icon="👥" color="#667eea" />
        <StatsCard title="Total Recipes" value={stats.totalRecipes} icon="📖" color="#f093fb" />
        <StatsCard title="Active Today" value={stats.usersActiveToday} icon="⚡" color="#4facfe" />
      </div>

      <div className="dashboard-section">
        <h2>Most Viewed Recipes</h2>
        <div className="recipe-list">
          {stats.mostViewedRecipes.map((recipe, i) => (
            <div key={i} className="recipe-item">
              <span className="recipe-rank">#{i + 1}</span>
              <div>
                <h3>{recipe.title}</h3>
                <p>{recipe.views} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;