import React from 'react';

function Navbar({ activePage, setActivePage, setToken }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        <span className="nav-title">🏗️ DOLE Central Luzon - Admin</span>
        <div className="nav-links">
          <button className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>Dashboard</button>
          <button className={activePage === 'users' ? 'active' : ''} onClick={() => setActivePage('users')}>Users</button>
          <button className={activePage === 'jobs' ? 'active' : ''} onClick={() => setActivePage('jobs')}>Jobs</button>
          <button className={activePage === 'reports' ? 'active' : ''} onClick={() => setActivePage('reports')}>Reports</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;