import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ token }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    workers: 0,
    clients: 0,
    verified: 0,
    pending: 0,
    totalJobs: 0,
    openJobs: 0,
    completedJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
    fetchRecentJobs();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const users = res.data;
      
      // Get jobs data
      const jobsRes = await axios.get('http://localhost:5000/api/jobs/open', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jobs = jobsRes.data;
      
      setStats({
        totalUsers: users.length,
        workers: users.filter(u => u.role === 'worker').length,
        clients: users.filter(u => u.role === 'client').length,
        verified: users.filter(u => u.is_verified).length,
        pending: users.filter(u => !u.is_verified && u.role !== 'admin').length,
        totalJobs: jobs.length,
        openJobs: jobs.filter(j => j.status === 'open').length,
        completedJobs: jobs.filter(j => j.status === 'completed').length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const users = res.data.filter(u => u.role !== 'admin').slice(0, 5);
      setRecentUsers(users);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/jobs/open', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentJobs(res.data.slice(0, 5));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Stat cards data
  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#1E3A8A', bgColor: '#EFF6FF' },
    { title: 'Workers', value: stats.workers, icon: '🔧', color: '#3B82F6', bgColor: '#EFF6FF' },
    { title: 'Clients', value: stats.clients, icon: '🏢', color: '#10B981', bgColor: '#EFF6FF' },
    { title: 'Verified', value: stats.verified, icon: '✅', color: '#22C55E', bgColor: '#EFF6FF' },
    { title: 'Pending Verification', value: stats.pending, icon: '⏳', color: '#F59E0B', bgColor: '#EFF6FF' },
    { title: 'Total Jobs', value: stats.totalJobs, icon: '📋', color: '#8B5CF6', bgColor: '#EFF6FF' },
    { title: 'Open Jobs', value: stats.openJobs, icon: '🟢', color: '#22C55E', bgColor: '#EFF6FF' },
    { title: 'Completed Jobs', value: stats.completedJobs, icon: '🎉', color: '#10B981', bgColor: '#EFF6FF' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Dashboard Overview</h1>
        <p style={styles.subtitle}>Welcome back, Administrator. Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div key={index} style={{ ...styles.statCard, borderTop: `4px solid ${card.color}` }}>
            <div style={styles.statIcon}>{card.icon}</div>
            <div style={styles.statContent}>
              <h3 style={styles.statValue}>{card.value}</h3>
              <p style={styles.statTitle}>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={styles.chartsRow}>
        {/* User Distribution Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>👥 User Distribution</h3>
          <div style={styles.pieChart}>
            <div style={styles.chartBars}>
              <div style={styles.chartBarItem}>
                <div style={{ ...styles.chartBar, width: `${(stats.workers / stats.totalUsers) * 100}%`, backgroundColor: '#3B82F6' }}></div>
                <span style={styles.chartLabel}>Workers ({stats.workers})</span>
              </div>
              <div style={styles.chartBarItem}>
                <div style={{ ...styles.chartBar, width: `${(stats.clients / stats.totalUsers) * 100}%`, backgroundColor: '#10B981' }}></div>
                <span style={styles.chartLabel}>Clients ({stats.clients})</span>
              </div>
              <div style={styles.chartBarItem}>
                <div style={{ ...styles.chartBar, width: `${(stats.verified / stats.totalUsers) * 100}%`, backgroundColor: '#22C55E' }}></div>
                <span style={styles.chartLabel}>Verified ({stats.verified})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📋 Verification Status</h3>
          <div style={styles.statusCircle}>
            <div style={styles.circleContainer}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10"/>
                <circle 
                  cx="60" cy="60" r="50" fill="none" 
                  stroke="#22C55E" 
                  strokeWidth="10"
                  strokeDasharray={`${(stats.verified / (stats.totalUsers - 1)) * 314} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div style={styles.circleText}>
                <span style={styles.circlePercent}>{Math.round((stats.verified / (stats.totalUsers - 1)) * 100)}%</span>
                <span style={styles.circleLabel}>Verified</span>
              </div>
            </div>
          </div>
          <div style={styles.statusLegend}>
            <span><span style={{ color: '#22C55E' }}>●</span> Verified: {stats.verified}</span>
            <span><span style={{ color: '#F59E0B' }}>●</span> Pending: {stats.pending}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.recentSection}>
        <div style={styles.recentCard}>
          <h3 style={styles.sectionTitle}>🕐 Recent Users</h3>
          <table style={styles.miniTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{ 
                      backgroundColor: user.role === 'worker' ? '#3B82F6' : '#10B981', 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: 12,
                      fontSize: 12
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.is_verified ? 
                      <span style={{ color: '#22C55E' }}>✅ Verified</span> : 
                      <span style={{ color: '#F59E0B' }}>⏳ Pending</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.recentCard}>
          <h3 style={styles.sectionTitle}>💼 Recent Jobs</h3>
          <table style={styles.miniTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Budget</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map(job => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>₱{job.budget}</td>
                  <td>
                    <span style={{ 
                      backgroundColor: job.status === 'open' ? '#22C55E' : '#F59E0B', 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: 12,
                      fontSize: 12
                    }}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '28px',
    color: '#1E3A8A',
    marginBottom: '10px'
  },
  subtitle: {
    color: '#6B7280',
    fontSize: '14px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  statIcon: {
    fontSize: '40px'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1F2937',
    margin: 0
  },
  statTitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '5px 0 0 0'
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  chartTitle: {
    fontSize: '18px',
    color: '#1E3A8A',
    marginBottom: '20px'
  },
  chartBars: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  chartBarItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  chartBar: {
    height: '30px',
    borderRadius: '5px',
    transition: 'width 0.5s ease'
  },
  chartLabel: {
    minWidth: '100px',
    fontSize: '14px',
    color: '#4B5563'
  },
  circleContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
    margin: '0 auto'
  },
  circleText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  circlePercent: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1E3A8A',
    display: 'block'
  },
  circleLabel: {
    fontSize: '10px',
    color: '#6B7280'
  },
  statusCircle: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  statusLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    fontSize: '14px'
  },
  recentSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px'
  },
  recentCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#1E3A8A',
    marginBottom: '15px'
  },
  miniTable: {
    width: '100%',
    borderCollapse: 'collapse'
  }
};

// Add this to your CSS file for animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  .loader {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #1E3A8A;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-right: 10px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Dashboard;