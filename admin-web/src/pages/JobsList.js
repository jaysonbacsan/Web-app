import React, { useState, useEffect } from 'react';
import axios from 'axios';

function JobsList({ token }) {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const res = await axios.get('http://localhost:5000/api/jobs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setJobs(res.data);
  };

  return (
    <div>
      <h2>Job Listings</h2>
      <table className="data-table">
        <thead>
          <tr><th>Title</th><th>Category</th><th>Budget</th><th>Status</th><th>Client</th></tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.category}</td>
              <td>₱{job.budget}</td>
              <td>{job.status}</td>
              <td>{job.clientName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobsList;