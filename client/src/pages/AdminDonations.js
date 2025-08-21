import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import {
  FaSort,
  FaEye,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaTruck,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaHandHoldingHeart
} from 'react-icons/fa';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchDonations();
  }, [sortField, sortDirection, currentPage]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      // Fetch from Food collection instead of Donation collection
      const response = await api.get('/api/food');
      console.log('Fetched donations:', response.data);
      setDonations(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to load donations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort donations
  const filteredDonations = donations
    .filter(donation => {
      const matchesSearch = donation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.donorName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter ? donation.status === statusFilter : true;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Handle nested fields
      const getNestedValue = (obj, path) => {
        if (!obj) return null;
        const keys = path.split('.');
        return keys.reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj);
      };

      const aValue = getNestedValue(a, sortField) || '';
      const bValue = getNestedValue(b, sortField) || '';

      if (sortField === 'createdAt' || sortField === 'expiryTime') {
        return sortDirection === 'asc' 
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStatusChange = async (donationId, newStatus) => {
    try {
      await api.put(`/api/food/${donationId}/status`, { status: newStatus });
      
      // Update local state
      setDonations(prevDonations =>
        prevDonations.map(donation =>
          donation._id === donationId ? { ...donation, status: newStatus } : donation
        )
      );
      
      toast.success(`Donation status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating donation status:', err);
      toast.error('Failed to update donation status');
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await api.delete(`/api/food/${donationId}`);
        setDonations(prevDonations => prevDonations.filter(donation => donation._id !== donationId));
        toast.success('Donation deleted successfully');
      } catch (err) {
        console.error('Error deleting donation:', err);
        toast.error('Failed to delete donation');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'available': { color: 'bg-green-100 text-green-800', text: 'Available' },
      'reserved': { color: 'bg-yellow-100 text-yellow-800', text: 'Reserved' },
      'picked-up': { color: 'bg-blue-100 text-blue-800', text: 'Picked Up' },
      'delivered': { color: 'bg-purple-100 text-purple-800', text: 'Delivered' },
      'expired': { color: 'bg-red-100 text-red-800', text: 'Expired' },
      'cancelled': { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig['available'];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // handleStatusChange function is already defined above

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Donation Management</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white shadow rounded-lg mb-6 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10 w-full rounded-md border-gray-300"
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-select w-full rounded-md border-gray-300"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="picked-up">Picked Up</option>
              <option value="delivered">Delivered</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex space-x-2">
            <select
              className="form-select w-full rounded-md border-gray-300"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="createdAt">Date Created</option>
              <option value="expiryTime">Expiry Date</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
            <button
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              <FaSort className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading donations...</p>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No donations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter ? 'Try adjusting your search or filters.' : 'There are no donations in the system yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((donation) => (
                <tr key={donation._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {donation.image ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={donation.image} alt={donation.title} />
                        ) : donation.images && donation.images.length > 0 ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={donation.images[0]} alt={donation.title} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaHandHoldingHeart className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{donation.title}</div>
                        <div className="text-sm text-gray-500">
                          {donation.quantity?.amount ? `${donation.quantity.amount} ${donation.quantity.unit || ''}` : 
                          (donation.quantity && typeof donation.quantity !== 'object' ? donation.quantity : 'Quantity not specified')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{donation.donorName || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{donation.organization?.name || 'Individual'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusBadge(donation.status)}
                      <div className="ml-2">
                        <select
                          className="form-select text-sm rounded-md border-gray-300"
                          value={donation.status}
                          onChange={(e) => handleStatusChange(donation._id, e.target.value)}
                        >
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="picked-up">Picked Up</option>
                          <option value="delivered">Delivered</option>
                          <option value="expired">Expired</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation.expiryTime ? new Date(donation.expiryTime).toLocaleDateString() : 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/donations/${donation._id}`} className="text-indigo-600 hover:text-indigo-900">
                        <FaEye className="h-5 w-5" />
                      </Link>
                      <Link to={`/donations/${donation._id}/edit`} className="text-blue-600 hover:text-blue-900">
                        <FaEdit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteDonation(donation._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredDonations.length > itemsPerPage && (
        <div className="flex justify-center mt-6">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`relative inline-flex items-center px-4 py-2 border ${currentPage === number ? 'bg-indigo-50 border-indigo-500 text-indigo-600 z-10' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdminDonations;