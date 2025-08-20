import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaPlus, FaSearch, FaHeart, FaHandHoldingHeart, FaBuilding, FaUser, FaClock, FaMapMarkerAlt, FaLock } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    donations: 0,
    requests: 0,
    organizations: 0,
    impact: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user stats and recent activity from API
    // For now, using mock data based on user role
    setTimeout(() => {
      const roleStats = {
        donor: {
          donations: 12,
          requests: 0,
          organizations: 0,
          impact: 45
        },
        recipient: {
          donations: 0,
          requests: 8,
          organizations: 0,
          impact: 12
        },
        volunteer: {
          donations: 25,
          requests: 0,
          organizations: 3,
          impact: 89
        },
        admin: {
          donations: 0,
          requests: 0,
          organizations: 15,
          impact: 234
        }
      };

      setStats(roleStats[user?.role] || {
        donations: 0,
        requests: 0,
        organizations: 0,
        impact: 0
      });

      // Role-specific recent activity
      const roleActivity = {
        donor: [
          {
            id: 1,
            type: 'donation',
            title: 'Fresh vegetables donated',
            time: '2 hours ago',
            status: 'completed'
          },
          {
            id: 2,
            type: 'donation',
            title: 'Bread and pastries shared',
            time: '1 day ago',
            status: 'completed'
          }
        ],
        recipient: [
          {
            id: 1,
            type: 'request',
            title: 'Food request fulfilled',
            time: '2 hours ago',
            status: 'completed'
          },
          {
            id: 2,
            type: 'request',
            title: 'Vegetables received',
            time: '1 day ago',
            status: 'completed'
          }
        ],
        volunteer: [
          {
            id: 1,
            type: 'donation',
            title: 'Food collected from restaurant',
            time: '3 hours ago',
            status: 'completed'
          },
          {
            id: 2,
            type: 'organization',
            title: 'New shelter registered',
            time: '2 days ago',
            status: 'completed'
          }
        ],
        admin: [
          {
            id: 1,
            type: 'organization',
            title: 'Food bank verification completed',
            time: '1 hour ago',
            status: 'completed'
          },
          {
            id: 2,
            type: 'organization',
            title: 'New organization approved',
            time: '1 day ago',
            status: 'completed'
          }
        ]
      };

      setRecentActivity(roleActivity[user?.role] || []);
      setLoading(false);
    }, 1000);
  }, [user]);

  const getRoleDisplayName = (role) => {
    const roleNames = {
      donor: 'Food Donor',
      recipient: 'Food Recipient',
      volunteer: 'Volunteer',
      admin: 'Administrator'
    };
    return roleNames[role] || role;
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      donor: 'You help reduce food waste by sharing excess food with those in need.',
      recipient: 'You can request food assistance when you need help.',
      volunteer: 'You coordinate food donations and help connect people with resources.',
      admin: 'You manage the platform and verify organizations.'
    };
    return descriptions[role] || 'You\'re part of our food rescue community.';
  };

  const getRoleStats = (role) => {
    const statConfigs = {
      donor: [
        { label: 'Donations Made', value: stats.donations, icon: FaHandHoldingHeart, color: 'text-green-400', bgColor: 'bg-green-100' },
        { label: 'People Helped', value: stats.impact, icon: FaUser, color: 'text-purple-400', bgColor: 'bg-purple-100' }
      ],
      recipient: [
        { label: 'Requests Made', value: stats.requests, icon: FaHeart, color: 'text-red-400', bgColor: 'bg-red-100' },
        { label: 'Times Helped', value: stats.impact, icon: FaUser, color: 'text-purple-400', bgColor: 'bg-purple-100' }
      ],
      volunteer: [
        { label: 'Donations Coordinated', value: stats.donations, icon: FaHandHoldingHeart, color: 'text-green-400', bgColor: 'bg-green-100' },
        { label: 'Organizations Added', value: stats.organizations, icon: FaBuilding, color: 'text-blue-400', bgColor: 'bg-blue-100' },
        { label: 'People Helped', value: stats.impact, icon: FaUser, color: 'text-purple-400', bgColor: 'bg-purple-100' }
      ],
      admin: [
        { label: 'Organizations Managed', value: stats.organizations, icon: FaBuilding, color: 'text-blue-400', bgColor: 'bg-blue-100' },
        { label: 'Total Impact', value: stats.impact, icon: FaUser, color: 'text-purple-400', bgColor: 'bg-purple-100' }
      ]
    };
    return statConfigs[role] || [];
  };

  const getQuickActions = (role) => {
    const baseActions = [
      {
        to: '/donations',
        label: 'Browse Donations',
        description: 'Find food donations near you',
        icon: FaHandHoldingHeart,
        color: 'text-green-400',
        bgColor: 'bg-green-100'
      },
      {
        to: '/requests',
        label: 'View Requests',
        description: 'See who needs help',
        icon: FaHeart,
        color: 'text-red-400',
        bgColor: 'bg-red-100'
      },
      {
        to: '/organizations',
        label: 'Organizations',
        description: 'Connect with food banks',
        icon: FaBuilding,
        color: 'text-blue-400',
        bgColor: 'bg-blue-100'
      }
    ];

    const roleActions = {
      donor: [
        {
          to: '/donations/create',
          label: 'Donate Food',
          description: 'Share your excess food',
          icon: FaPlus,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      ],
      recipient: [
        {
          to: '/requests/create',
          label: 'Request Food',
          description: 'Ask for food assistance',
          icon: FaPlus,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        }
      ],
      volunteer: [
        {
          to: '/donations/create',
          label: 'Coordinate Donation',
          description: 'Help collect and distribute food',
          icon: FaPlus,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          to: '/organizations/create',
          label: 'Add Organization',
          description: 'Register new food banks/shelters',
          icon: FaPlus,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        }
      ],
      admin: [
        {
          to: '/donations/create',
          label: 'Create Donation',
          description: 'Admin donation management',
          icon: FaPlus,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          to: '/requests/create',
          label: 'Create Request',
          description: 'Admin request management',
          icon: FaPlus,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        },
        {
          to: '/organizations/create',
          label: 'Add Organization',
          description: 'Register new organizations',
          icon: FaPlus,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        }
      ]
    };

    return [...baseActions, ...(roleActions[role] || [])];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                {getRoleDescription(user?.role)}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              {user?.role === 'donor' && (
                <Link
                  to="/donations/create"
                  className="btn-primary flex items-center space-x-2"
                >
                  <FaPlus className="h-4 w-4" />
                  <span>Donate Food</span>
                </Link>
              )}
              {user?.role === 'recipient' && (
                <Link
                  to="/requests/create"
                  className="btn-primary flex items-center space-x-2"
                >
                  <FaPlus className="h-4 w-4" />
                  <span>Request Food</span>
                </Link>
              )}
              {(user?.role === 'volunteer' || user?.role === 'admin') && (
                <div className="flex space-x-2">
                  <Link
                    to="/donations/create"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FaPlus className="h-4 w-4" />
                    <span>Donate Food</span>
                  </Link>
                  <Link
                    to="/organizations/create"
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <FaBuilding className="h-4 w-4" />
                    <span>Add Org</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Role-Specific Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {getRoleStats(user?.role).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.label}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getQuickActions(user?.role).map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.to}
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${action.bgColor}`}>
                        <Icon className={`h-5 w-5 ${action.color}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        {action.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            {recentActivity.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.type === 'donation' ? 'bg-green-500' : 
                              activity.type === 'request' ? 'bg-red-500' : 'bg-blue-500'
                            }`}>
                              {activity.type === 'donation' ? (
                                <FaHandHoldingHeart className="h-4 w-4 text-white" />
                              ) : activity.type === 'request' ? (
                                <FaHeart className="h-4 w-4 text-white" />
                              ) : (
                                <FaBuilding className="h-4 w-4 text-white" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {activity.title}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <FaClock className="inline h-4 w-4 mr-1" />
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaLock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start using the platform to see your activity here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
