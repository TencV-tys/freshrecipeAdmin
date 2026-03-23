import React, { useState, useEffect } from 'react';
import { getStats } from '../api/adminApi';
import AdminSidebar from '../components/AdminSidebar';
import StatsCard from '../components/StatsCard';
import styles from '../styles/AdminDashboard.module.css';

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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <AdminSidebar active="dashboard" />
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>Dashboard</h1>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className={styles.welcome}>
            <span>👋</span>
            <span>Welcome back, Admin!</span>
          </div>
        </header>

        <div className={styles.statsGrid}>
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="#667eea"
          />
          <StatsCard
            title="Total Recipes"
            value={stats.totalRecipes}
            icon="📖"
            color="#f093fb"
          />
          <StatsCard
            title="Active Today"
            value={stats.usersActiveToday}
            icon="⚡"
            color="#4facfe"
          />
        </div>

        <div className={styles.section}>
          <h2>Most Viewed Recipes</h2>
          <div className={styles.recipeList}>
            {stats.mostViewedRecipes.map((recipe, i) => (
              <div key={i} className={styles.recipeItem}>
                <span className={styles.rank}>#{i + 1}</span>
                <div>
                  <h3>{recipe.title}</h3>
                  <p>{recipe.views} views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;