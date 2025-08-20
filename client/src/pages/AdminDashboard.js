import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  FaUsers,
  FaHandHoldingHeart,
  FaBuilding,
  FaClipboardList,
  FaUserPlus,
  FaPlusCircle,
  FaChartBar,
  FaCog,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    donations: 0,
    organizations: 0,
    requests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/stats');
        setStats(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Failed to load dashboard statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Admin modules
  const adminModules = [
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: FaUsers,
      link: '/admin/users',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'organization-management',
      title: 'Organization Management',
      description: 'Manage food banks, shelters, and other organizations',
      icon: FaBuilding,
      link: '/admin/organizations',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'donation-management',
      title: 'Donation Management',
      description: 'Oversee all food donations and their status',
      icon: FaHandHoldingHeart,
      link: '/admin/donations',
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      id: 'order-management',
      title: 'Order Management',
      description: 'Manage and approve food orders and deliveries',
      icon: FaClipboardList,
      link: '/admin/orders',
      color: 'text-orange-500',
      bgColor: 'bg-orange-100'
    },
    {
      id: 'request-management',
      title: 'Request Management',
      description: 'Manage food requests and distribution',
      icon: FaClipboardList,
      link: '/admin/requests',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      description: 'View detailed platform statistics and generate reports',
      icon: FaChartBar,
      link: '/admin/analytics',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure platform settings and preferences',
      icon: FaCog,
      link: '/admin/settings',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      id: 'add-user',
      title: 'Add User',
      description: 'Create a new user account',
      icon: FaUserPlus,
      link: '/admin/users/create',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'create-organization',
      title: 'Create Organization',
      description: 'Add a new organization to the platform',
      icon: FaBuilding,
      link: '/organizations/create',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'add-donation',
      title: 'Add Donation',
      description: 'Create a new food donation',
      icon: FaHandHoldingHeart,
      link: '/donations/create',
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      id: 'create-request',
      title: 'Create Request',
      description: 'Submit a new food request',
      icon: FaClipboardList,
      link: '/requests/create',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}. Here's an overview of your platform.
        </p>
      </div>

      {error && (
        <div className="mb-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Stat */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                <FaUsers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.users}
                </p>
              </div>
            </div>
          </div>

          {/* Donations Stat */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                <FaHandHoldingHeart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.donations}
                </p>
              </div>
            </div>
          </div>

          {/* Organizations Stat */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                <FaBuilding className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Organizations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.organizations}
                </p>
              </div>
            </div>
          </div>

          {/* Requests Stat */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                <FaClipboardList className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Food Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.requests}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.link}
                className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200 flex items-start space-x-4"
              >
                <div className={`p-3 rounded-full ${action.bgColor} ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Modules */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Administration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.id}
                to={module.link}
                className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-full ${module.bgColor} ${module.color} mr-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{module.title}</h3>
                </div>
                <p className="text-gray-600">{module.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;