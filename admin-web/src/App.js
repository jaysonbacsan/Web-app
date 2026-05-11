import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/UsersList';
import VerificationRequests from './pages/VerificationRequests';
import ReportsList from './pages/ReportsList';
import './styles/App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div>
      <nav className="navbar">
        <div className="nav-brand">
          <h2>🏗️ DOLE Central Luzon - Admin Portal</h2>
        </div>
        <div className="nav-tabs">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            📊 Dashboard
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            👥 All Users
          </button>
          <button className={activeTab === 'verification' ? 'active' : ''} onClick={() => setActiveTab('verification')}>
            📋 Verification Requests
          </button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
            🚨 Reports
          </button>
          <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); setToken(null); }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="content">
        {activeTab === 'dashboard' && <Dashboard token={token} />}
        {activeTab === 'users' && <UsersList token={token} />}
        {activeTab === 'verification' && <VerificationRequests token={token} />}
        {activeTab === 'reports' && <ReportsList token={token} />}
      </div>
    </div>
  );
}

export default App;