import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UsersList({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.filter(u => u.role !== 'admin'));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/toggle`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Account status changed');
      fetchUsers();
    } catch (err) {
      alert('Failed to toggle account');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('⚠️ Delete user permanently?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('User deleted');
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading users...</div>;
  }

  return (
    <div>
      <h2>👥 All Registered Users</h2>
      <p>Total users: {users.length}</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr style={{ backgroundColor: '#1E3A8A', color: 'white' }}>
            <th style={{ padding: 12, textAlign: 'left' }}>ID</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Role</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Verified</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 10 }}>{user.id}</td>
              <td style={{ padding: 10 }}>{user.name}</td>
              <td style={{ padding: 10 }}>{user.email}</td>
              <td style={{ padding: 10 }}>
                <span style={{ 
                  backgroundColor: user.role === 'worker' ? '#3B82F6' : '#10B981', 
                  color: 'white', 
                  padding: '3px 8px', 
                  borderRadius: 5 
                }}>
                  {user.role}
                </span>
              </td>
              <td style={{ padding: 10 }}>
                {user.is_verified ? '✅ Verified' : '⏳ Pending'}
              </td>
              <td style={{ padding: 10 }}>
                {user.is_active ? '🟢 Active' : '🔴 Disabled'}
              </td>
              <td style={{ padding: 10 }}>
                <button 
                  onClick={() => handleToggle(user.id)}
                  style={{ backgroundColor: user.is_active ? '#EF4444' : '#22C55E', color: 'white', border: 'none', padding: '5px 10px', margin: '2px', borderRadius: 3, cursor: 'pointer' }}
                >
                  {user.is_active ? 'Disable' : 'Enable'}
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  style={{ backgroundColor: '#DC2626', color: 'white', border: 'none', padding: '5px 10px', margin: '2px', borderRadius: 3, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersList;