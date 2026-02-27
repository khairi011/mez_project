import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
    } else {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-lg font-semibold">Total Users</h2>
            <p className="text-2xl">{stats.users}</p>
          </div>
          <div className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-lg font-semibold">Total Orders</h2>
            <p className="text-2xl">{stats.orders?.total || 0}</p>
          </div>
          <div className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-lg font-semibold">Total Revenue</h2>
            <p className="text-2xl">${stats.orders?.revenue || 0}</p>
          </div>
        </div>
      ) : (
        <p>No stats available</p>
      )}
    </div>
  );
}