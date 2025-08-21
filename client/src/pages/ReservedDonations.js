import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import {
  FaMapMarkerAlt,
  FaClock,
  FaHandHoldingHeart,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTruck,
  FaWalking
} from 'react-icons/fa';

const ReservedDonations = () => {
  const { user } = useAuth();
  const [reservedDonations, setReservedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservedDonations = async () => {
      try {
        // Fetch orders instead of reserved donations to get both pickup and delivery orders
        console.log('Fetching user orders');
        const response = await api.get('/api/orders/user');
        // Filter out cancelled orders
        const activeOrders = response.data.filter(order => order.status !== 'cancelled');
        setReservedDonations(activeOrders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reserved donations:', err);
        setError(err.response?.data?.message || 'Failed to fetch reserved donations');
        setLoading(false);
      }
    };

    fetchReservedDonations();
  }, []);

  const handleMarkAsPickedUp = async (donationId) => {
    try {
      await api.post(`/api/donations/${donationId}/pickup`);
      
      // Update the local state to reflect the change
      setReservedDonations(prevDonations => 
        prevDonations.map(donation => 
          donation._id === donationId 
            ? { ...donation, status: 'picked-up', pickedUpAt: new Date() }
            : donation
        )
      );
    } catch (err) {
      console.error('Error marking donation as picked up:', err);
      setError(err.response?.data?.message || 'Failed to mark donation as picked up');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'available': { color: 'bg-green-100 text-green-800', text: 'Available' },
      'reserved': { color: 'bg-yellow-100 text-yellow-800', text: 'Reserved' },
      'picked-up': { color: 'bg-blue-100 text-blue-800', text: 'Picked Up' },
      'expired': { color: 'bg-red-100 text-red-800', text: 'Expired' },
      'cancelled': { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'confirmed': { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' },
      'ready': { color: 'bg-green-100 text-green-800', text: 'Ready for Pickup' },
      'in-transit': { color: 'bg-purple-100 text-purple-800', text: 'In Transit' },
      'delivered': { color: 'bg-green-100 text-green-800', text: 'Delivered' },
      'completed': { color: 'bg-green-100 text-green-800', text: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig['available'];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your reserved donations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link to="/dashboard" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reserved Donations</h1>
          <p className="mt-2 text-gray-600">
            Manage the food donations you've reserved for pickup
          </p>
        </div>

        {reservedDonations.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <FaHandHoldingHeart className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No reserved donations</h3>
            <p className="mt-1 text-gray-500">
              You haven't reserved any food donations yet.
            </p>
            <div className="mt-6">
              <Link
                to="/donations"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Browse Available Donations
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reservedDonations.map((donation) => (
              <div
                key={donation._id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
              >
                {/* Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  {donation.image ? (
                    <img
                      src={donation.image}
                      alt={donation.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : donation.images?.length > 0 ? (
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
                      {donation.donation ? donation.donation.title : donation.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {donation.orderType && (
                        <span className={`inline-flex items-center ${donation.orderType === 'delivery' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} text-xs font-medium px-2.5 py-0.5 rounded-full mr-2`}>
                          {donation.orderType === 'delivery' ? <><FaTruck className="mr-1" /> Delivery</> : <><FaWalking className="mr-1" /> Pickup</>}
                        </span>
                      )}
                      {getStatusBadge(donation.status)}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {donation.donation ? donation.donation.description : donation.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <FaHandHoldingHeart className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-bold text-black">
                        {donation.donation && donation.donation.quantity?.amount ? 
                          `${donation.donation.quantity.amount} ${donation.donation.quantity.unit || ''}` : 
                          (donation.quantity?.amount ? `${donation.quantity.amount} ${donation.quantity.unit || ''}` : 
                          (donation.quantity && typeof donation.quantity !== 'object' ? donation.quantity : 'Quantity not specified'))}
                      </span>
                    </div>
                    {donation.orderType === 'delivery' ? (
                      <>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                          <span>
                            Delivery to: {donation.deliveryAddress ? 
                              `${donation.deliveryAddress.street}, ${donation.deliveryAddress.city}` : 
                              'Address not available'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaClock className="h-4 w-4 mr-2" />
                          <span>
                            Delivery on:{' '}
                            {donation.deliveryTime ? new Date(donation.deliveryTime).toLocaleDateString() : 'To be determined'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                          <span>
                            {donation.donation && donation.donation.location?.address ? 
                              `${donation.donation.location.address.street || ''}, ${donation.donation.location.address.city || ''}` : 
                              (donation.location?.address ? 
                                `${donation.location.address.street || ''}, ${donation.location.address.city || ''}` : 
                                (typeof donation.location === 'string' ? donation.location : 'Location not available'))}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaClock className="h-4 w-4 mr-2" />
                          <span>
                            Pickup by:{' '}
                            {donation.donation ? new Date(donation.donation.pickupDate).toLocaleDateString() : new Date(donation.pickupDate).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">from</span>
                      <span className="text-sm font-medium text-gray-900">
                        {donation.donation ? donation.donation.donor?.name : (donation.donor?.name || 'Unknown')}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={donation.donation ? `/orders/${donation._id}` : `/donations/${donation._id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <FaEye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                      
                      {/* For legacy reserved donations */}
                      {donation.status === 'reserved' && !donation.orderType && (
                        <button
                          onClick={() => handleMarkAsPickedUp(donation._id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <FaCheckCircle className="h-3 w-3 mr-1" />
                          Picked Up
                        </button>
                      )}
                      
                      {/* For pickup orders */}
                      {donation.status === 'ready' && donation.orderType === 'pickup' && (
                        <button
                          onClick={async () => {
                            try {
                              await api.put(`/api/orders/${donation._id}/complete`);
                              
                              // Update the local state to reflect the change
                              setReservedDonations(prevDonations => 
                                prevDonations.map(d => 
                                  d._id === donation._id ? { ...d, status: 'completed' } : d
                                )
                              );
                              toast.success('Order marked as completed');
                            } catch (err) {
                              console.error('Error updating order:', err);
                              toast.error(err.response?.data?.message || 'Failed to update order');
                            }
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <FaCheckCircle className="h-3 w-3 mr-1" />
                          Picked Up
                        </button>
                      )}
                      
                      {/* For delivery orders */}
                      {donation.status === 'in-transit' && donation.orderType === 'delivery' && (
                        <button
                          onClick={async () => {
                            try {
                              await api.put(`/api/orders/${donation._id}/status`, { status: 'delivered' });
                              
                              // Update the local state to reflect the change
                              setReservedDonations(prevDonations => 
                                prevDonations.map(d => 
                                  d._id === donation._id ? { ...d, status: 'delivered' } : d
                                )
                              );
                              toast.success('Order marked as delivered');
                            } catch (err) {
                              console.error('Error updating order:', err);
                              toast.error(err.response?.data?.message || 'Failed to update order');
                            }
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <FaCheckCircle className="h-3 w-3 mr-1" />
                          Confirm Delivery
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservedDonations;