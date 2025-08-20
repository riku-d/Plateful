import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaBuilding, FaMapMarkerAlt, FaClock, FaEye, FaStar } from 'react-icons/fa';

const Organizations = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    services: '',
    location: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Fetch organizations from API
    setTimeout(() => {
      setOrganizations([
        {
          id: 1,
          name: 'Community Food Bank',
          description: 'Providing food assistance to families in need',
          type: 'food-bank',
          services: ['food-distribution', 'emergency-assistance'],
          location: 'Downtown Area',
          operatingHours: 'Mon-Fri 9AM-5PM',
          rating: { average: 4.8, count: 45 },
          status: 'active',
          logo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
        },
        {
          id: 2,
          name: 'Hope Shelter',
          description: 'Emergency shelter with food services',
          type: 'shelter',
          services: ['shelter', 'food-services', 'counseling'],
          location: 'Westside District',
          operatingHours: '24/7',
          rating: { average: 4.6, count: 32 },
          status: 'active',
          logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filters.type || org.type === filters.type;
    const matchesServices = !filters.services || org.services.includes(filters.services);
    
    return matchesSearch && matchesType && matchesServices;
  });

  const getTypeDisplayName = (type) => {
    const types = {
      'food-bank': 'Food Bank',
      'shelter': 'Shelter',
      'community-center': 'Community Center',
      'church': 'Church',
      'nonprofit': 'Non-Profit'
    };
    return types[type] || type;
  };

  // Check if user can create organizations
  const canCreateOrganization = user && ['volunteer', 'admin'].includes(user.role);

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
                Organizations
              </h1>
              <p className="mt-2 text-gray-600">
                Connect with food banks, shelters, and community organizations
              </p>
            </div>
            {canCreateOrganization && (
              <Link
                to="/organizations/create"
                className="btn-primary flex items-center space-x-2"
              >
                <FaBuilding className="h-4 w-4" />
                <span>
                  {user.role === 'volunteer' ? 'Add Organization' : 'Create Organization'}
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
                <label htmlFor="search" className="sr-only">Search organizations</label>
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
                    placeholder="Search organizations..."
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Organization Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="food-bank">Food Bank</option>
                  <option value="shelter">Shelter</option>
                  <option value="community-center">Community Center</option>
                  <option value="church">Church</option>
                  <option value="nonprofit">Non-Profit</option>
                </select>
              </div>

              {/* Services Filter */}
              <div>
                <label htmlFor="services" className="block text-sm font-medium text-gray-700">
                  Services
                </label>
                <select
                  id="services"
                  name="services"
                  value={filters.services}
                  onChange={(e) => setFilters({ ...filters, services: e.target.value })}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Services</option>
                  <option value="food-distribution">Food Distribution</option>
                  <option value="emergency-assistance">Emergency Assistance</option>
                  <option value="shelter">Shelter</option>
                  <option value="counseling">Counseling</option>
                  <option value="job-training">Job Training</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrganizations.map((org) => (
            <div key={org.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
              {/* Logo */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src={org.logo}
                  alt={org.name}
                  className="w-full h-48 object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {org.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getTypeDisplayName(org.type)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {org.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                    <span>{org.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="h-4 w-4 mr-2" />
                    <span>{org.operatingHours}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaStar className="h-4 w-4 mr-2 text-yellow-400" />
                    <span>{typeof org.rating === 'object' ? org.rating.average : org.rating} rating</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {org.services.slice(0, 2).map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {service.replace('-', ' ')}
                      </span>
                    ))}
                    {org.services.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{org.services.length - 2} more
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/organizations/${org.id}`}
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

        {filteredOrganizations.length === 0 && (
          <div className="text-center py-12">
            <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters to find more organizations.
            </p>
            {canCreateOrganization && (
              <div className="mt-4">
                <Link
                  to="/organizations/create"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <FaBuilding className="h-4 w-4" />
                  <span>Add the first organization!</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Organizations;
