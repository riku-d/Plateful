import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaHandHoldingHeart,
  FaEye
} from 'react-icons/fa';

const Donations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    foodType: '',
    status: '',
    location: '',
    radius: 10
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch('/api/donations'); // ✅ call backend
        if (!response.ok) {
          throw new Error('Failed to fetch donations');
        }
        const data = await response.json();
        
        // Ensure we're getting donations with donor information
        const donationsWithDonorInfo = data.map(donation => {
          if (!donation.donor) {
            return {
              ...donation,
              donor: { name: 'Unknown Donor' }
            };
          }
          return donation;
        });
        
        setDonations(donationsWithDonorInfo); // ✅ backend now returns array of donations with donor info
      } catch (err) {
        console.error('Error fetching donations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFoodType =
      !filters.foodType || donation.foodType === filters.foodType;
    const matchesStatus =
      !filters.status || donation.status === filters.status;

    return matchesSearch && matchesFoodType && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      'picked-up': 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      available: 'Available',
      reserved: 'Reserved',
      'picked-up': 'Picked Up',
      expired: 'Expired',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  // Check if user can create donations
  const canCreateDonation =
    user && ['donor', 'volunteer', 'admin'].includes(user.role);

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
                Food Donations
              </h1>
              <p className="mt-2 text-gray-600">
                Find and claim available food donations in your area
              </p>
            </div>
            {canCreateDonation && (
              <Link
                to="/donations/create"
                className="btn-primary flex items-center space-x-2"
              >
                <FaHandHoldingHeart className="h-4 w-4" />
                <span>
                  {user.role === 'donor'
                    ? 'Donate Food'
                    : user.role === 'volunteer'
                    ? 'Coordinate Donation'
                    : 'Create Donation'}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="sm:col-span-2">
                <label htmlFor="search" className="sr-only">
                  Search donations
                </label>
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
                    placeholder="Search donations..."
                  />
                </div>
              </div>

              {/* Food Type Filter */}
              <div>
                <label
                  htmlFor="foodType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Food Type
                </label>
                <select
                  id="foodType"
                  name="foodType"
                  value={filters.foodType}
                  onChange={(e) =>
                    setFilters({ ...filters, foodType: e.target.value })
                  }
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

              {/* Status Filter */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="picked-up">Picked Up</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Donations Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDonations.map((donation) => (
            <div
              key={donation._id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              {/* Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {donation.images?.length > 0 ? (
                  <img
                    src={donation.images[0]}
                    alt={donation.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {donation.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      donation.status
                    )}`}
                  >
                    {getStatusText(donation.status)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {donation.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaHandHoldingHeart className="h-4 w-4 mr-2" />
                    <span>
                      {donation.quantity?.amount} {donation.quantity?.unit}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                    <span>
                      {donation.location?.address ? 
                        (typeof donation.location.address === 'object' ? 
                          `${donation.location.address.street || ''}, ${donation.location.address.city || ''}` : 
                          donation.location.address) : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="h-4 w-4 mr-2" />
                    <span>
                      Pickup by:{' '}
                      {donation.pickupTime
                        ? new Date(donation.pickupTime).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">by</span>
                    <span className="text-sm font-medium text-gray-900">
                      {donation.donor?.name || 'Unknown'}
                    </span>
                    {donation.donor?.rating && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({typeof donation.donor.rating === 'object' ? 
                          donation.donor.rating.average : 
                          donation.donor.rating}★)
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/donations/${donation._id}`}
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

        {filteredDonations.length === 0 && (
          <div className="text-center py-12">
            <FaHandHoldingHeart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No donations found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters to find more donations.
            </p>
            {canCreateDonation && (
              <div className="mt-4">
                <Link
                  to="/donations/create"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <FaHandHoldingHeart className="h-4 w-4" />
                  <span>Be the first to donate!</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Donations;
