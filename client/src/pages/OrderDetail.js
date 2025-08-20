import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaClock, FaUtensils, FaLeaf, FaSnowflake, FaExclamationTriangle, FaTruck, FaWalking } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [selectedPickupTime, setSelectedPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderType, setOrderType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    coordinates: {
      lat: null,
      lng: null
    }
  });
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState('');
  
  // Google Maps API key - in a real app, this would be stored in environment variables
  const googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key
  
  const mapRef = useRef(null);
  const originRef = useRef(null);
  const destinationRef = useRef(null);

  useEffect(() => {
    const fetchDonationDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/donations/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setDonation(data);
          // Set default pickup time if available
          if (data.pickupTimes && data.pickupTimes.length > 0) {
            setSelectedPickupTime(`${data.pickupTimes[0].day} ${data.pickupTimes[0].startTime}-${data.pickupTimes[0].endTime}`);
          }
        } else {
          toast.error(data.message || 'Failed to fetch donation details');
          navigate('/order-food');
        }
      } catch (error) {
        console.error('Error fetching donation details:', error);
        toast.error('Something went wrong. Please try again later.');
        navigate('/order-food');
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetails();
  }, [id, navigate]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= donation.quantity) {
      setOrderQuantity(value);
    }
  };

  // Function to handle address autocomplete and geocoding
  const handleAddressSelect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setDeliveryAddress(prev => ({
          ...prev,
          coordinates: {
            lat: latitude,
            lng: longitude
          }
        }));
        
        // Reverse geocode to get address details
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const addressComponents = results[0].address_components;
            
            // Extract address components
            let street = '';
            let city = '';
            let state = '';
            let zipCode = '';
            
            addressComponents.forEach(component => {
              const types = component.types;
              
              if (types.includes('street_number')) {
                street = component.long_name + ' ';
              } else if (types.includes('route')) {
                street += component.long_name;
              } else if (types.includes('locality')) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
              } else if (types.includes('postal_code')) {
                zipCode = component.long_name;
              }
            });
            
            setDeliveryAddress(prev => ({
              ...prev,
              street,
              city,
              state,
              zipCode
            }));
          }
        });
      });
    }
  };
  
  // Function to calculate route and delivery time
  const calculateRoute = () => {
    if (!donation || !donation.pickupLocation || !donation.pickupLocation.coordinates || 
        !deliveryAddress.coordinates.lat || !deliveryAddress.coordinates.lng) {
      return;
    }
    
    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(
          donation.pickupLocation.coordinates.lat,
          donation.pickupLocation.coordinates.lng
        ),
        destination: new window.google.maps.LatLng(
          deliveryAddress.coordinates.lat,
          deliveryAddress.coordinates.lng
        ),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          
          // Extract distance and duration
          const route = result.routes[0];
          if (route && route.legs[0]) {
            setDistance(route.legs[0].distance.text);
            setDuration(route.legs[0].duration.text);
            
            // Calculate estimated delivery time (current time + duration + 30 min preparation)
            const durationInMinutes = route.legs[0].duration.value / 60;
            const now = new Date();
            const estimatedDelivery = new Date(now.getTime() + (durationInMinutes + 30) * 60000);
            setDeliveryTime(estimatedDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        } else {
          console.error('Directions request failed due to ' + status);
          toast.error('Could not calculate delivery route. Please try again.');
        }
      }
    );
  };
  
  // Handle map load event
  const handleMapLoad = (map) => {
    mapRef.current = map;
    setMapLoaded(true);
  };
  
  // Effect to calculate route when delivery address changes
  useEffect(() => {
    if (orderType === 'delivery' && mapLoaded && 
        deliveryAddress.coordinates.lat && deliveryAddress.coordinates.lng && 
        donation && donation.pickupLocation && donation.pickupLocation.coordinates) {
      calculateRoute();
    }
  }, [deliveryAddress.coordinates, mapLoaded, orderType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to place an order');
      navigate('/login');
      return;
    }
    
    if (orderType === 'pickup' && !selectedPickupTime) {
      toast.error('Please select a pickup time');
      return;
    }
    
    if (orderType === 'delivery') {
      if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
        toast.error('Please provide a complete delivery address');
        return;
      }
      
      if (!deliveryAddress.coordinates.lat || !deliveryAddress.coordinates.lng) {
        toast.error('Unable to locate your delivery address. Please try again.');
        return;
      }
    }
    
    try {
      setSubmitting(true);
      
      const orderData = {
        donationId: donation._id,
        quantity: orderQuantity,
        orderType,
        notes: notes
      };
      
      if (orderType === 'pickup') {
        orderData.pickupTime = selectedPickupTime;
      } else {
        orderData.deliveryAddress = deliveryAddress;
        orderData.deliveryTime = new Date();
      }
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Order placed successfully! ${orderType === 'delivery' ? 'Your food will be delivered soon.' : 'Please pick up your food at the selected time.'}`);
        navigate('/orders');
      } else {
        toast.error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
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

  if (!donation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Donation not found or has been removed.</span>
        </div>
        <button 
          onClick={() => navigate('/order-food')} 
          className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
        >
          Back to Food Listings
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Image Gallery */}
        <div className="relative h-80 bg-gray-200">
          {donation.images && donation.images.length > 0 ? (
            <img 
              src={donation.images[0]} 
              alt={donation.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{donation.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {donation.foodType && (
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                  <FaUtensils className="mr-1" />
                  {donation.foodType}
                </span>
              )}
              {donation.dietary && donation.dietary.map(diet => (
                <span key={diet} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                  <FaLeaf className="mr-1" />
                  {diet}
                </span>
              ))}
              {donation.requiresRefrigeration && (
                <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                  <FaSnowflake className="mr-1" />
                  Refrigeration Required
                </span>
              )}
            </div>
            <p className="text-gray-600">{donation.description}</p>
          </div>
          
          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pickup Information</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-500 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-800">Location</h3>
                    <p className="text-gray-600">{donation.pickupLocation.address}</p>
                    {donation.pickupLocation.instructions && (
                      <p className="text-gray-500 text-sm mt-1">{donation.pickupLocation.instructions}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaClock className="text-gray-500 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-800">Available Pickup Times</h3>
                    <ul className="text-gray-600">
                      {donation.pickupTimes && donation.pickupTimes.map((time, index) => (
                        <li key={index} className="mb-1">
                          {time.day}: {time.startTime} - {time.endTime}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Food Information</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-800">Quantity Available</h3>
                  <p className="text-gray-600">{donation.quantity} {donation.quantityUnit}</p>
                </div>
                
                {donation.expirationDate && (
                  <div>
                    <h3 className="font-medium text-gray-800">Best Before</h3>
                    <p className="text-gray-600">{new Date(donation.expirationDate).toLocaleDateString()}</p>
                  </div>
                )}
                
                {donation.allergens && donation.allergens.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800 flex items-center">
                      <FaExclamationTriangle className="text-yellow-500 mr-2" />
                      Allergens
                    </h3>
                    <p className="text-gray-600">{donation.allergens.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Order Form */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Place Your Order</h2>
            
            {/* Order Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`flex items-center px-4 py-2 rounded-lg ${orderType === 'pickup' ? 'bg-green-100 text-green-800 border-2 border-green-500' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}
                >
                  <FaWalking className="mr-2" />
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`flex items-center px-4 py-2 rounded-lg ${orderType === 'delivery' ? 'bg-green-100 text-green-800 border-2 border-green-500' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}
                >
                  <FaTruck className="mr-2" />
                  Delivery
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (Max: {donation.quantity} {donation.quantityUnit})
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={donation.quantity}
                  value={orderQuantity}
                  onChange={handleQuantityChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              {orderType === 'pickup' ? (
                <div>
                  <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Pickup Time
                  </label>
                  <select
                    id="pickupTime"
                    value={selectedPickupTime}
                    onChange={(e) => setSelectedPickupTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select a time</option>
                    {donation.pickupTimes && donation.pickupTimes.map((time, index) => (
                      <option key={index} value={`${time.day} ${time.startTime}-${time.endTime}`}>
                        {time.day} ({time.startTime} - {time.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Delivery Information</h3>
                  
                  {/* Delivery Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="street"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={deliveryAddress.state}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        value={deliveryAddress.zipCode}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, zipCode: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Use Current Location Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleAddressSelect}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center"
                    >
                      <FaMapMarkerAlt className="mr-2" />
                      Use My Current Location
                    </button>
                  </div>
                  
                  {/* Google Maps */}
                  <div className="mt-4">
                    <LoadScript googleMapsApiKey={googleMapsApiKey} onLoad={() => setMapLoaded(true)}>
                      <div style={{ height: '300px', width: '100%' }}>
                        <GoogleMap
                          mapContainerStyle={{ height: '100%', width: '100%' }}
                          center={deliveryAddress.coordinates.lat ? 
                            { lat: deliveryAddress.coordinates.lat, lng: deliveryAddress.coordinates.lng } : 
                            { lat: 40.7128, lng: -74.0060 } // Default to NYC
                          }
                          zoom={13}
                          onLoad={handleMapLoad}
                        >
                          {deliveryAddress.coordinates.lat && (
                            <Marker
                              position={{
                                lat: deliveryAddress.coordinates.lat,
                                lng: deliveryAddress.coordinates.lng
                              }}
                              label="Delivery"
                            />
                          )}
                          
                          {donation.pickupLocation && donation.pickupLocation.coordinates && (
                            <Marker
                              position={{
                                lat: donation.pickupLocation.coordinates.lat,
                                lng: donation.pickupLocation.coordinates.lng
                              }}
                              label="Pickup"
                            />
                          )}
                          
                          {directions && <DirectionsRenderer directions={directions} />}
                        </GoogleMap>
                      </div>
                    </LoadScript>
                  </div>
                  
                  {/* Delivery Information */}
                  {distance && duration && (
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Delivery Information</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-sm text-gray-600">Distance:</span>
                          <p className="font-medium">{distance}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Estimated Delivery Time:</span>
                          <p className="font-medium">{deliveryTime}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={orderType === 'pickup' ? "Any special requests or notes for pickup" : "Any special delivery instructions"}
                ></textarea>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/order-food')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition-colors duration-300"
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `${orderType === 'pickup' ? 'Place Pickup Order' : 'Place Delivery Order'}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;