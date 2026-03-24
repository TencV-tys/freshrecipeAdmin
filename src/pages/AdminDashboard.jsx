import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getDashboardData } from '../api/adminApi';
import StatsCard from '../components/StatsCard';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    usersActiveToday: 0,
    mostViewedRecipes: []
  });
  const [dashboardData, setDashboardData] = useState({
    weeklyStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, dashboardData] = await Promise.all([
          getStats(),
          getDashboardData()
        ]);
        setStats(statsData);
        setDashboardData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare data for user growth chart
  const userGrowthData = dashboardData.weeklyStats?.map(week => ({
    date: week.date,
    users: week.newUsers,
    recipes: week.newRecipes
  })) || [];

  const hasChartData = userGrowthData.some(d => d.users > 0 || d.recipes > 0);

  const handleCardClick = (type) => {
    if (type === 'users') {
      navigate('/admin/users');
    } else if (type === 'recipes') {
      navigate('/admin/recipes');
    }
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/admin/recipes?edit=${recipeId}`);
  };

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

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div onClick={() => handleCardClick('users')} style={{ cursor: 'pointer' }}>
          <StatsCard title="Total Users" value={stats.totalUsers} icon="👥" color="#667eea" />
        </div>
        <div onClick={() => handleCardClick('recipes')} style={{ cursor: 'pointer' }}>
          <StatsCard title="Total Recipes" value={stats.totalRecipes} icon="📖" color="#f093fb" />
        </div>
        <StatsCard title="Active Today" value={stats.usersActiveToday} icon="⚡" color="#4facfe" />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* User Growth Chart */}
        <div className="chart-card full-width">
          <h2>User Growth & Activity</h2>
          {!hasChartData ? (
            <div className="empty-chart">
              <span>📊</span>
              <p>No data available yet</p>
              <small>New users and recipes will appear here</small>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  labelStyle={{ color: '#1e293b' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#ff6b6b" 
                  strokeWidth={2}
                  name="New Users"
                  dot={{ fill: '#ff6b6b', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="recipes" 
                  stroke="#4ecdc4" 
                  strokeWidth={2}
                  name="New Recipes"
                  dot={{ fill: '#4ecdc4', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekly Activity Area Chart */}
        <div className="chart-card full-width">
          <h2>Weekly Activity Overview</h2>
          {!hasChartData ? (
            <div className="empty-chart">
              <span>📈</span>
              <p>No activity data yet</p>
              <small>User activity will appear here</small>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1"
                  stroke="#ff6b6b" 
                  fill="#ff6b6b" 
                  fillOpacity={0.3}
                  name="New Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="recipes" 
                  stackId="1"
                  stroke="#4ecdc4" 
                  fill="#4ecdc4" 
                  fillOpacity={0.3}
                  name="New Recipes"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Most Viewed Recipes */}
        <div className="chart-card full-width">
          <h2>Most Viewed Recipes</h2>
          {stats.mostViewedRecipes?.length === 0 ? (
            <div className="empty-state">
              <span>🍽️</span>
              <h3>No recipes viewed yet</h3>
              <p>When users view recipes, they'll appear here</p>
              <button className="add-recipe-btn" onClick={() => navigate('/admin/recipes')}>
                Add Your First Recipe
              </button>
            </div>
          ) : (
            <div className="recipe-list">
              {stats.mostViewedRecipes.map((recipe, i) => (
                <div 
                  key={i} 
                  className="recipe-item clickable"
                  onClick={() => handleRecipeClick(recipe._id)}
                >
                  <span className="recipe-rank">#{i + 1}</span>
                  <div className="recipe-info">
                    <h3>{recipe.title}</h3>
                    <p>{recipe.views} views</p>
                  </div>
                  <div className="recipe-bar">
                    <div 
                      className="recipe-bar-fill" 
                      style={{ width: `${(recipe.views / (stats.mostViewedRecipes[0]?.views || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="recipe-arrow">→</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;