import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const OrderFood = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    foodType: '',
    distance: '',
    availability: ''
  });

  useEffect(() => {
    const fetchAvailableDonations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/donations/available');
        const data = await response.json();
        
        if (response.ok) {
          setDonations(data);
        } else {
          toast.error(data.message || 'Failed to fetch available donations');
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
        toast.error('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDonations();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredDonations = donations.filter(donation => {
    // Search term filter
    const matchesSearch = donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Food type filter
    const matchesFoodType = !filters.foodType || donation.foodType === filters.foodType;
    
    // Distance filter - this would require geolocation implementation
    // For now, we'll assume all match
    const matchesDistance = true;
    
    // Availability filter
    const matchesAvailability = !filters.availability || 
                               (filters.availability === 'today' && isAvailableToday(donation.pickupTimes));
    
    return matchesSearch && matchesFoodType && matchesDistance && matchesAvailability;
  });

  // Helper function to check if donation is available today
  const isAvailableToday = (pickupTimes) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return pickupTimes.some(time => time.day.toLowerCase() === today);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Food</h1>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for food..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-2">
            <select
              name="foodType"
              value={filters.foodType}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Food Types</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="non-vegetarian">Non-Vegetarian</option>
              <option value="dessert">Dessert</option>
            </select>
            
            <select
              name="distance"
              value={filters.distance}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Any Distance</option>
              <option value="1">Within 1 mile</option>
              <option value="5">Within 5 miles</option>
              <option value="10">Within 10 miles</option>
            </select>
            
            <select
              name="availability"
              value={filters.availability}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Any Time</option>
              <option value="today">Available Today</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Food Listings */}
      {filteredDonations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map(donation => (
            <div key={donation._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {donation.images && donation.images.length > 0 ? (
                <img 
                  src={donation.images[0]} 
                  alt={donation.title} 
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{donation.title}</h2>
                <p className="text-gray-600 mb-3 line-clamp-2">{donation.description}</p>
                
                <div className="flex items-center text-gray-500 mb-2">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{donation.pickupLocation.address}</span>
                </div>
                
                <div className="flex items-center text-gray-500 mb-3">
                  <FaClock className="mr-2" />
                  <span>Available: {formatPickupTimes(donation.pickupTimes)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-medium">
                    {donation.quantity} {donation.quantityUnit} available
                  </span>
                  <Link 
                    to={`/order/${donation._id}`} 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No food available</h2>
          <p className="text-gray-600">Try adjusting your filters or check back later for new donations.</p>
        </div>
      )}
    </div>
  );
};

// Helper function to format pickup times for display
const formatPickupTimes = (pickupTimes) => {
  if (!pickupTimes || pickupTimes.length === 0) return 'Not specified';
  
  // Just show the first time slot for brevity in the card
  const firstTime = pickupTimes[0];
  return `${firstTime.day} ${firstTime.startTime} - ${firstTime.endTime}`;
};

export default OrderFood;