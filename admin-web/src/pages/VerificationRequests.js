import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VerificationRequests({ token }) {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/pending-verifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Verification requests:', res.data);
      setVerifications(res.data);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to fetch verification requests');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/verify-user/${userId}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`User ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      fetchVerificationRequests();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to verify user'));
    }
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    // Extract just the filename from the full path
    const fileName = filePath.split('\\').pop().split('/').pop();
    // Return the URL through the server
    return `http://localhost:5000/uploads/${fileName}`;
  };

  const isImage = (filePath) => {
    if (!filePath) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
  };

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading verification requests...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#1E3A8A', marginBottom: 10 }}>📋 Verification Requests</h2>
      <p style={{ marginBottom: 20, color: '#666' }}>Users who have submitted verification documents for review.</p>

      {verifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, backgroundColor: '#f9f9f9', borderRadius: 10 }}>
          <p>No pending verification requests.</p>
          <p>Users who submit documents will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 30 }}>
          {verifications.map((item) => (
            <div key={item.id} style={{ 
              backgroundColor: '#fff', 
              borderRadius: 10, 
              padding: 20, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${item.status === 'pending' ? '#F59E0B' : '#22C55E'}`
            }}>
              {/* User Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                  <h3 style={{ color: '#1E3A8A', marginBottom: 10 }}>{item.user?.name || 'Unknown User'}</h3>
                  <p><strong>Email:</strong> {item.user?.email}</p>
                  <p><strong>Role:</strong> 
                    <span style={{ 
                      backgroundColor: item.user?.role === 'worker' ? '#3B82F6' : '#10B981', 
                      color: 'white', 
                      padding: '2px 10px', 
                      borderRadius: 20,
                      marginLeft: 10,
                      fontSize: 12
                    }}>
                      {item.user?.role}
                    </span>
                  </p>
                  {item.user?.business_name && (
                    <p><strong>Business Name:</strong> {item.user.business_name}</p>
                  )}
                  <p><strong>Submitted:</strong> {new Date(item.submitted_at).toLocaleString()}</p>
                  <p><strong>Status:</strong> 
                    <span style={{ 
                      backgroundColor: item.status === 'pending' ? '#F59E0B' : '#22C55E', 
                      color: 'white', 
                      padding: '2px 10px', 
                      borderRadius: 20,
                      marginLeft: 10,
                      fontSize: 12
                    }}>
                      {item.status}
                    </span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    onClick={() => handleVerify(item.user_id, 'approved')}
                    style={{ 
                      backgroundColor: '#22C55E', 
                      color: 'white', 
                      border: 'none', 
                      padding: '10px 20px', 
                      borderRadius: 5, 
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button 
                    onClick={() => handleVerify(item.user_id, 'rejected')}
                    style={{ 
                      backgroundColor: '#EF4444', 
                      color: 'white', 
                      border: 'none', 
                      padding: '10px 20px', 
                      borderRadius: 5, 
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div style={{ marginTop: 20 }}>
                <h4 style={{ marginBottom: 15, color: '#374151' }}>📎 Uploaded Documents:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                  
                  {/* Valid ID - Image */}
                  {item.valid_id_path && isImage(item.valid_id_path) && (
                    <div style={{ textAlign: 'center', width: 150 }}>
                      <div 
                        onClick={() => setSelectedImage(getFileUrl(item.valid_id_path))}
                        style={{ 
                          width: 150, 
                          height: 150, 
                          backgroundColor: '#f0f0f0', 
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          border: '1px solid #ddd'
                        }}
                      >
                        <img 
                          src={getFileUrl(item.valid_id_path)} 
                          alt="Valid ID"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image' }}
                        />
                      </div>
                      <p style={{ marginTop: 5, fontSize: 12 }}>🪪 Valid ID</p>
                    </div>
                  )}

                  {/* Resume - PDF/File */}
                  {item.resume_path && (
                    <div style={{ textAlign: 'center', width: 150 }}>
                      <a 
                        href={getFileUrl(item.resume_path)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={{ 
                          width: 150, 
                          height: 150, 
                          backgroundColor: '#f0f0f0', 
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          border: '1px solid #ddd',
                          transition: 'transform 0.2s'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: 50 }}>📄</span>
                            <p style={{ fontSize: 12, marginTop: 5, color: '#3B82F6' }}>Click to View</p>
                          </div>
                        </div>
                      </a>
                      <p style={{ marginTop: 5, fontSize: 12 }}>📄 Resume/CV</p>
                    </div>
                  )}

                  {/* Business Permit - Image */}
                  {item.business_permit_path && isImage(item.business_permit_path) && (
                    <div style={{ textAlign: 'center', width: 150 }}>
                      <div 
                        onClick={() => setSelectedImage(getFileUrl(item.business_permit_path))}
                        style={{ 
                          width: 150, 
                          height: 150, 
                          backgroundColor: '#f0f0f0', 
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          border: '1px solid #ddd'
                        }}
                      >
                        <img 
                          src={getFileUrl(item.business_permit_path)} 
                          alt="Business Permit"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image' }}
                        />
                      </div>
                      <p style={{ marginTop: 5, fontSize: 12 }}>🏢 Business Permit</p>
                    </div>
                  )}

                  {/* NBI Clearance - Image */}
                  {item.nbi_clearance_path && isImage(item.nbi_clearance_path) && (
                    <div style={{ textAlign: 'center', width: 150 }}>
                      <div 
                        onClick={() => setSelectedImage(getFileUrl(item.nbi_clearance_path))}
                        style={{ 
                          width: 150, 
                          height: 150, 
                          backgroundColor: '#f0f0f0', 
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          border: '1px solid #ddd'
                        }}
                      >
                        <img 
                          src={getFileUrl(item.nbi_clearance_path)} 
                          alt="NBI Clearance"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image' }}
                        />
                      </div>
                      <p style={{ marginTop: 5, fontSize: 12 }}>🔍 NBI Clearance</p>
                    </div>
                  )}
                </div>

                {/* Skills Information (for workers) */}
                {(item.skills || item.experience_years || item.hourly_rate) && (
                  <div style={{ 
                    marginTop: 20, 
                    padding: 15, 
                    backgroundColor: '#f0fdf4', 
                    borderRadius: 10,
                    borderLeft: '4px solid #22C55E'
                  }}>
                    <h4 style={{ marginBottom: 10, color: '#166534' }}>🛠️ Worker Information</h4>
                    {item.skills && <p><strong>Skills:</strong> {item.skills}</p>}
                    {item.experience_years && <p><strong>Experience:</strong> {item.experience_years} years</p>}
                    {item.hourly_rate && <p><strong>Hourly Rate:</strong> ₱{item.hourly_rate}</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            cursor: 'pointer'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img 
              src={selectedImage} 
              alt="Document Preview" 
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: -40,
                right: 0,
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 30,
                height: 30,
                fontSize: 20,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificationRequests;