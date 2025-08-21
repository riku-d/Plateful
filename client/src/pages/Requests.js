import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaHeart, FaMapMarkerAlt, FaClock, FaEye, FaExclamationTriangle } from 'react-icons/fa';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    foodType: '',
    urgency: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Fetch requests from API
    setTimeout(() => {
      setRequests([
        {
          id: 1,
          title: 'Need fresh vegetables',
          description: 'Looking for fresh vegetables for family meals',
          foodTypes: ['vegetables'],
          quantity: '3 kg',
          urgency: 'high',
          status: 'open',
          neededBy: '2024-01-22',
          location: 'Downtown Area',
          requester: {
            name: 'Maria Garcia',
            rating: { average: 4.6, count: 12 }
          }
        },
        {
          id: 2,
          title: 'Bread and dairy needed',
          description: 'Need bread and dairy products for children',
          foodTypes: ['bakery', 'dairy'],
          quantity: '2 loaves, 1L milk',
          urgency: 'medium',
          status: 'in-progress',
          neededBy: '2024-01-25',
          location: 'Westside Mall',
          requester: {
            name: 'David Brown',
            rating: { average: 4.8, count: 19 }
          }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFoodType = !filters.foodType || request.foodTypes.includes(filters.foodType);
    const matchesUrgency = !filters.urgency || request.urgency === filters.urgency;
    const matchesStatus = !filters.status || request.status === filters.status;
    
    return matchesSearch && matchesFoodType && matchesUrgency && matchesStatus;
  });

  const getUrgencyColor = (urgency) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      fulfilled: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Check if user can create requests
  const canCreateRequest = user && ['recipient', 'admin'].includes(user.role);

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
                Food Requests
              </h1>
              <p className="mt-2 text-gray-600">
                Help fulfill food requests from people in need
              </p>
            </div>
            {canCreateRequest && (
              <Link
                to="/requests/create"
                className="btn-primary flex items-center space-x-2"
              >
                <FaHeart className="h-4 w-4" />
                <span>
                  {user.role === 'recipient' ? 'Request Food' : 'Create Request'}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Search */}
              <div>
                <label htmlFor="search" className="sr-only">Search requests</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Search requests..."
                  />
                </div>
              </div>

              {/* Food Type Filter */}
              <div>
                <label htmlFor="foodType" className="block text-sm font-medium text-gray-700">
                  Food Type
                </label>
                <select
                  id="foodType"
                  name="foodType"
                  value={filters.foodType}
                  onChange={(e) => setFilters({ ...filters, foodType: e.target.value })}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="dairy">Dairy</option>
                  <option value="meat">Meat</option>
                  <option value="bakery">Bakery</option>
                  <option value="canned">Canned Goods</option>
                  <option value="grains">Grains</option>
                </select>
              </div>

              {/* Urgency Filter */}
              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">
                  Urgency
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  value={filters.urgency}
                  onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Urgency</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.title}
                  </h3>
                  <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency === 'high' && <FaExclamationTriangle className="h-3 w-3 mr-1" />}
                      {request.urgency}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {request.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaHeart className="h-4 w-4 mr-2" />
                    <span>{request.quantity}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                    <span>{request.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="h-4 w-4 mr-2" />
                    <span>Needed by: {new Date(request.neededBy).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">by</span>
                    <span className="text-sm font-medium text-gray-900">{request.requester.name}</span>
                    {request.requester.rating && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({typeof request.requester.rating === 'object' ? 
                          request.requester.rating.average : 
                          request.requester.rating}★)
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/requests/${request.id}`}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <FaEye className="h-4 w-4" />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FaHeart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters to find more requests.
            </p>
            {canCreateRequest && (
              <div className="mt-4">
                <Link
                  to="/requests/create"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <FaHeart className="h-4 w-4" />
                  <span>Be the first to request food!</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
