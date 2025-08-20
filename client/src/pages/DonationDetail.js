import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaMapMarkerAlt, FaClock, FaHandHoldingHeart, FaUser, FaPhone, FaCalendarAlt, FaTag, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const DonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reserving, setReserving] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await axios.get(`/api/donations/${id}`);
        setDonation(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch donation details');
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  const handleReserveDonation = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/donations/${id}` } });
      return;
    }

    try {
      setReserving(true);
      const res = await axios.post(`/api/donations/${id}/reserve`);
      setDonation(res.data);
      setSuccess('Donation reserved successfully! Please pick it up at the specified time.');
      setReserving(false);
      // Redirect to the reserved donations page after successful reservation
      navigate('/donations/reserved');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve donation');
      setReserving(false);
    }
  };

  const handlePickupDonation = async () => {
    try {
      setReserving(true);
      const res = await axios.post(`/api/donations/${id}/pickup`);
      setDonation(res.data);
      setSuccess('Donation marked as picked up!');
      setReserving(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark donation as picked up');
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading donation details...</p>
        </div>
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
          <Link to="/donations" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            Back to Donations
          </Link>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Donation Not Found</h2>
          <p className="mt-2 text-gray-600">The donation you're looking for doesn't exist or has been removed.</p>
          <Link to="/donations" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            Back to Donations
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'available': { color: 'bg-green-100 text-green-800', text: 'Available' },
      'reserved': { color: 'bg-yellow-100 text-yellow-800', text: 'Reserved' },
      'picked-up': { color: 'bg-blue-100 text-blue-800', text: 'Picked Up' },
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

  const isRecipient = user && user.role === 'recipient';
  const isDonor = user && donation && user.id === donation.donor._id;
  const isReservedByUser = user && donation.reservedBy && user.id === donation.reservedBy._id;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Donation Header */}
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{donation.title}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Posted by {donation.donor.name} • {new Date(donation.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              {getStatusBadge(donation.status)}
            </div>
          </div>

          {/* Donation Images */}
          {donation.images && donation.images.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {donation.images.map((image, index) => (
                    <div key={index} className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                      <img src={image} alt={`${donation.title} - ${index + 1}`} className="w-full h-48 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Donation Details */}
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{donation.description}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Food Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {donation.foodType.charAt(0).toUpperCase() + donation.foodType.slice(1)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {donation.quantity && typeof donation.quantity === 'object' ? 
                    `${donation.quantity.amount || ''} ${donation.quantity.unit || ''}` : 
                    (donation.quantity || 'Quantity not specified')}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Pickup Location</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                  <FaMapMarkerAlt className="h-4 w-4 text-gray-400 mr-2" />
                  {donation.location.address ? (
                    <span>
                      {donation.location.address.street}, {donation.location.address.city}, {donation.location.address.state} {donation.location.address.zipCode}
                    </span>
                  ) : (
                    <span>{donation.location.toString()}</span>
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Pickup Date & Time</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                  <FaCalendarAlt className="h-4 w-4 text-gray-400 mr-2" />
                  <span>
                    {new Date(donation.pickupDate).toLocaleDateString()} • 
                    {donation.pickupTime?.start && donation.pickupTime?.end ? 
                      `${donation.pickupTime.start} - ${donation.pickupTime.end}` : 
                      'Flexible'}
                  </span>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Expiration Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(donation.expirationDate).toLocaleDateString()}
                </dd>
              </div>
              {donation.dietaryRestrictions && donation.dietaryRestrictions.length > 0 && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Dietary Information</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {donation.dietaryRestrictions.map((diet, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {diet}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
              {donation.allergens && donation.allergens.length > 0 && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Allergens</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {donation.allergens.map((allergen, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
              {donation.tags && donation.tags.length > 0 && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {donation.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <FaTag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Donor Information */}
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Donor Information</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                    <FaUser className="h-4 w-4 text-gray-400 mr-2" />
                    {donation.donor.name}
                  </dd>
                </div>
                {donation.donor.phone && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Contact</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                      <FaPhone className="h-4 w-4 text-gray-400 mr-2" />
                      {donation.donor.phone}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <Link to="/donations" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Back to Donations
              </Link>
              <div className="space-x-3">
                {isRecipient && donation.status === 'available' && (
                  <button
                    onClick={handleReserveDonation}
                    disabled={reserving}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {reserving ? 'Reserving...' : 'Reserve for Pickup'}
                  </button>
                )}
                {isReservedByUser && donation.status === 'reserved' && (
                  <button
                    onClick={handlePickupDonation}
                    disabled={reserving}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {reserving ? 'Processing...' : 'Mark as Picked Up'}
                  </button>
                )}
                {isDonor && donation.status === 'available' && (
                  <Link
                    to={`/donations/edit/${donation._id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Donation
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDetail;
