import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', { email, password });
      
      const res = await axios.post('http://localhost:5000/api/login', { 
        email, 
        password 
      });
      
      console.log('Login response:', res.data);
      
      if (res.data.success) {
        if (res.data.user.role === 'admin') {
          localStorage.setItem('token', res.data.token);
          setToken(res.data.token);
          alert('✅ Welcome Admin!');
        } else {
          setError('Access denied. Admin only!');
        }
      } else {
        setError(res.data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Server error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1E3A8A' }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 10, textAlign: 'center', width: 350 }}>
        <h1 style={{ color: '#1E3A8A' }}>🏗️ DOLE Central Luzon</h1>
        <h3>Admin Access Only</h3>
        
        {error && <p style={{ color: 'red', marginBottom: 10 }}>{error}</p>}
        
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ccc', borderRadius: 5 }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ccc', borderRadius: 5 }}
        />
        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{ background: '#1E3A8A', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5, cursor: 'pointer', width: '100%' }}
        >
          {loading ? 'Please wait...' : 'Login as Admin'}
        </button>
        <p style={{ marginTop: 15, fontSize: 12, color: '#666' }}>Admin: admin@dole.gov.ph / dole123</p>
      </div>
    </div>
  );
}

export default Login;