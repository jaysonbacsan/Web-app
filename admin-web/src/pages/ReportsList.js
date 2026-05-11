import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReportsList({ token }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    if (window.confirm('Ban this user?')) {
      try {
        await axios.put(`http://localhost:5000/api/admin/users/${userId}/toggle`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('User has been banned');
        fetchReports();
      } catch (err) {
        alert('Failed to ban user');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Reports & Violations</h2>
      {reports.length === 0 ? (
        <p>No reports yet</p>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Reported By</th>
              <th>Reported User</th>
              <th>Reason</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.reporter?.name || 'Unknown'}</td>
                <td>{report.reported?.name || 'Unknown'}</td>
                <td>{report.reason}</td>
                <td>{report.description}</td>
                <td>{report.status}</td>
                <td>
                  <button 
                    className="ban-btn" 
                    onClick={() => handleBanUser(report.reported_id)}
                  >
                    Ban User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReportsList;