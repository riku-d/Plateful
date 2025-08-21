import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { 
  FaHandHoldingHeart, 
  FaUpload, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock,
  FaInfoCircle,
  FaTimes,
  FaShieldAlt,
  FaSnowflake,
  FaTemperatureHigh,
  FaSpinner,
  FaImage
} from 'react-icons/fa';

const CreateDonation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    foodType: '',
    quantity: '',
    quantityUnit: 'kg',
    status: 'available',
    location: '',
    pickupDate: '',
    pickupTime: '',
    dietaryInfo: '',
    allergens: [],
    storageInstructions: '',
    donorNumber: user?.phone || '',
    contactEmail: user?.email || '',
    expirationDate: '',
    freshness: 'fresh', // fresh, day-old, older
    isRefrigerated: false,
    isFrozen: false,
    safetyNotes: '',
    donorName: user?.name || '',
    packaging: '',
    humidity: '',
    temperature: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Check for URL parameters (from event calendar integration)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventTitle = params.get('event');
    const eventLocation = params.get('location');
    
    if (eventTitle || eventLocation) {
      setFormData(prev => ({
        ...prev,
        title: eventTitle ? `Surplus food from: ${eventTitle}` : prev.title,
        location: eventLocation || prev.location,
        description: eventTitle ? `Leftover food from ${eventTitle} event` : prev.description
      }));
      
      toast.success('Event details pre-filled! Please complete the remaining information.');
    }
  }, [location]);

  // Populate form with user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        donorName: user.name || '',
        donorNumber: user.phone || '',
        contactEmail: user.email || ''
      }));
    }
  }, [user]);

  const foodTypes = [
    'vegetables', 'fruits', 'dairy', 'meat', 'bakery', 
    'canned', 'grains', 'beverages', 'snacks', 'Rajma','Dal','Idli' ,'other'
  ];

  const quantityUnits = ['kg', 'grams', 'pieces', 'packets', 'bottles', 'cans', 'loaves', 'dozen'];

  const commonAllergens = [
    'nuts', 'dairy', 'eggs', 'soy', 'wheat', 'fish', 'shellfish', 'gluten'
  ];
  
  const freshnessOptions = [
    { value: 'fresh', label: 'Fresh (prepared today)' },
    { value: 'day-old', label: 'Day-old (prepared yesterday)' },
    { value: 'older', label: 'Older (2+ days)' }
  ];
  


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAllergenToggle = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      toast.error('Some files were invalid. Only images under 5MB are allowed.');
    }

    if (images.length + validFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to create a donation');
      return;
    }

    if (!formData.donorName || !formData.title || !formData.description || !formData.foodType || !formData.quantity || 
        !formData.location || !formData.packaging || !formData.humidity || !formData.temperature || !formData.donorNumber) {
      toast.error('Please fill in all required fields including donor name, packaging, humidity, temperature, and WhatsApp number');
      return;
    }

    setLoading(true);
    try {
      // Prepare donation data
      const donationData = {
        title: formData.title,
        description: formData.description,
        foodType: formData.foodType,
        quantity: {
          amount: parseFloat(formData.quantity),
          unit: formData.quantityUnit
        },
        expirationDate: formData.expirationDate
          ? new Date(`${formData.expirationDate}T00:00`)
          : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        location: {
          address: {
            street: formData.location,
            city: user.address?.city || '',
            state: user.address?.state || '',
            zipCode: user.address?.zipCode || ''
          },
          coordinates: user.location?.coordinates || { lat: 0, lng: 0 },
          pickupInstructions: formData.pickupInstructions || ''
        },
        dietaryRestrictions: formData.dietaryInfo ? formData.dietaryInfo.split(',').map(item => item.trim()) : [],
        allergens: formData.allergens || [],
        isRefrigerated: formData.isRefrigerated,
        isFrozen: formData.isFrozen,
        tags: [formData.freshness],
        estimatedValue: 0,
        isUrgent: false,
        safetyInfo: {
          freshness: formData.freshness,
          safetyNotes: formData.safetyNotes
        }
      };

      // Upload images if any
      if (images.length > 0) {
        // In a real implementation, you would upload images to a server/cloud storage
        // and get back URLs to store in the donation
        // For now, we'll just simulate this
        donationData.images = images.map(img => URL.createObjectURL(img.file));
      }

      // ✅ API call to backend (foodRoutes.js) with required fields
      const foodData = {
        donorName: formData.donorName,
        foodType: formData.foodType,
        quantity: parseFloat(formData.quantity),
        donorNumber: formData.donorNumber,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        packaging: formData.packaging,
        humidity: parseFloat(formData.humidity),
        temperature: parseFloat(formData.temperature)
      };

      const response = await api.post('/api/food/donate', foodData);
      const result = response.data;
      toast.success(`Donation created successfully! ${result.food.expiryHours}`);
      navigate('/donations');
    } catch (error) {
      console.error('Donation creation error:', error);
      toast.error(error.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please log in to create a donation</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaHandHoldingHeart className="mr-3 text-primary-600" />
            Donate Food
          </h1>
          <p className="mt-2 text-gray-600">
            Share your excess food with those in need. Your donation can make a real difference.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          {/* Pickup & Location Information */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-red-500" />
                Pickup Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">Let people know when and where they can pick up the food.</p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">Pickup Date *</label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="pickupDate"
                    id="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">Pickup Time *</label>
                <div className="mt-1">
                  <input
                    type="time"
                    name="pickupTime"
                    id="pickupTime"
                    value={formData.pickupTime}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Pickup Location *</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Building name, room number, etc."
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="locationNotes" className="block text-sm font-medium text-gray-700">Location Notes</label>
                <div className="mt-1">
                  <textarea
                    id="locationNotes"
                    name="locationNotes"
                    rows={2}
                    value={formData.locationNotes}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Additional directions, access instructions, etc."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <FaImage className="mr-2 text-purple-500" />
                Images
              </h3>
              <p className="mt-1 text-sm text-gray-500">Upload images of the food you're donating (optional).</p>
            </div>

            <div>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Preview`}
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-8 sm:pt-10">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Submitting...
                  </>
                ) : (
                  'Create Donation'
                )}
              </button>
            </div>
          </div>
          
          {/* Basic Information */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <FaInfoCircle className="mr-2" />
                Basic Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">Provide details about the food you're donating.</p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="donorName" className="block text-sm font-medium text-gray-700">Donor Name *</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="donorName"
                    id="donorName"
                    value={formData.donorName}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="E.g., Fresh Vegetables from Campus Garden"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe the food you're donating, its condition, etc."
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="foodType" className="block text-sm font-medium text-gray-700">Food Type *</label>
                <div className="mt-1">
                  <select
                    id="foodType"
                    name="foodType"
                    value={formData.foodType}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select food type</option>
                    {foodTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity *</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                    placeholder="Amount"
                    min="0.1"
                    step="0.1"
                    required
                  />
                  <select
                    name="quantityUnit"
                    value={formData.quantityUnit}
                    onChange={handleChange}
                    className="focus:ring-primary-500 focus:border-primary-500 inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                  >
                    {quantityUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Food Safety Information */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <FaShieldAlt className="mr-2 text-green-600" />
                Food Safety & Quality
              </h3>
              <p className="mt-1 text-sm text-gray-500">Help recipients understand the safety and quality of your food donation.</p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="freshness" className="block text-sm font-medium text-gray-700">Freshness Level *</label>
                <div className="mt-1">
                  <select
                    id="freshness"
                    name="freshness"
                    value={formData.freshness}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    {freshnessOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>



              <div className="sm:col-span-3">
                <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Expiration Date</label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="expirationDate"
                    id="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>



              <div className="sm:col-span-6">
                <label htmlFor="safetyNotes" className="block text-sm font-medium text-gray-700">Safety Notes</label>
                <div className="mt-1">
                  <textarea
                    id="safetyNotes"
                    name="safetyNotes"
                    rows={2}
                    value={formData.safetyNotes}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Any special handling or safety instructions..."
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <fieldset>
                  <legend className="text-sm font-medium text-gray-700">Storage Conditions</legend>
                  <div className="mt-2 space-y-2">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="isRefrigerated"
                          name="isRefrigerated"
                          type="checkbox"
                          checked={formData.isRefrigerated}
                          onChange={(e) => setFormData({...formData, isRefrigerated: e.target.checked})}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="isRefrigerated" className="font-medium text-gray-700 flex items-center">
                          <FaTemperatureHigh className="mr-1 text-blue-500" />
                          Refrigerated
                        </label>
                      </div>
                    </div>
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="isFrozen"
                          name="isFrozen"
                          type="checkbox"
                          checked={formData.isFrozen}
                          onChange={(e) => setFormData({...formData, isFrozen: e.target.checked})}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="isFrozen" className="font-medium text-gray-700 flex items-center">
                          <FaSnowflake className="mr-1 text-cyan-500" />
                          Frozen
                        </label>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          {/* Allergen Information */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Dietary & Allergen Information</h3>
              <p className="mt-1 text-sm text-gray-500">Help people with dietary restrictions or allergies.</p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="dietaryInfo" className="block text-sm font-medium text-gray-700">Dietary Information</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="dietaryInfo"
                    id="dietaryInfo"
                    value={formData.dietaryInfo}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="E.g., vegetarian, vegan, halal, kosher (comma separated)"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <fieldset>
                  <legend className="text-sm font-medium text-gray-700">Contains Allergens</legend>
                  <div className="mt-2 grid grid-cols-2 gap-y-2 sm:grid-cols-4">
                    {commonAllergens.map(allergen => (
                      <div key={allergen} className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`allergen-${allergen}`}
                            name="allergens"
                            type="checkbox"
                            checked={formData.allergens.includes(allergen)}
                            onChange={() => handleAllergenToggle(allergen)}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`allergen-${allergen}`} className="font-medium text-gray-700">
                            {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          {/* Food Safety Information */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <FaShieldAlt className="mr-2 text-green-500" />
                Food Safety Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">Help ensure the food remains safe for consumption.</p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="freshness" className="block text-sm font-medium text-gray-700">Freshness Level</label>
                <div className="mt-1">
                  <select
                    id="freshness"
                    name="freshness"
                    value={formData.freshness}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    {freshnessOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>



              <div className="sm:col-span-6">
                <label htmlFor="safetyNotes" className="block text-sm font-medium text-gray-700">Safety Notes</label>
                <div className="mt-1">
                  <textarea
                    id="safetyNotes"
                    name="safetyNotes"
                    rows={2}
                    value={formData.safetyNotes}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Any special handling or storage instructions..."
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="packaging" className="block text-sm font-medium text-gray-700">Packaging Type *</label>
                <div className="mt-1">
                  <select
                    id="packaging"
                    name="packaging"
                    value={formData.packaging}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select packaging</option>
                    <option value="plastic">Plastic</option>
                    <option value="glass">Glass</option>
                    <option value="paper">Paper</option>
                    <option value="metal">Metal</option>
                    <option value="cloth">Cloth</option>
                    <option value="none">No Packaging</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="humidity" className="block text-sm font-medium text-gray-700">Humidity (%) *</label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="humidity"
                    id="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., 65"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Temperature (°C) *</label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="temperature"
                    id="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., 25"
                    min="-40"
                    max="100"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6 pt-8 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Contact Information</h3>
              <p className="mt-1 text-sm text-gray-500">How can recipients contact you about this donation?</p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="donorNumber" className="block text-sm font-medium text-gray-700">WhatsApp Number *</label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="donorNumber"
                    id="donorNumber"
                    value={formData.donorNumber}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder={user.phone || "+91XXXXXXXXXX"}
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="contactPhone"
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder={user.phone || "Your phone number"}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="contactEmail"
                    id="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder={user.email || "Your email address"}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8 sm:pt-10">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Submitting...
                  </>
                ) : (
                  'Create Donation'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Form - Consolidated */}
      <div className="bg-white shadow rounded-lg mt-8 hidden">
        {/* This form is now hidden as we've consolidated to a single form */}
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Food Title * <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Fresh Organic Vegetables, Homemade Bread"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description * <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe the food items, condition, and any special details..."
                  />
                </div>

                <div>
                  <label htmlFor="foodType" className="block text-sm font-medium text-gray-700">
                    Food Type * <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="foodType"
                    id="foodType"
                    required
                    value={formData.foodType}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select food type</option>
                    {foodTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                      Quantity * <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      required
                      min="0"
                      step="0.1"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Amount"
                    />
                  </div>
                  <div>
                    <label htmlFor="quantityUnit" className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <select
                      name="quantityUnit"
                      id="quantityUnit"
                      value={formData.quantityUnit}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      {quantityUnits.map(unit => (
                        <option key={unit} value={unit}>
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pickup Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Pickup Location * <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Downtown Mall, 123 Main St"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">
                    Pickup Date * <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="pickupDate"
                      id="pickupDate"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.pickupDate}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">
                    Pickup Time
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      name="pickupTime"
                      id="pickupTime"
                      value={formData.pickupTime}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Food Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Food Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="dietaryInfo" className="block text-sm font-medium text-gray-700">
                    Dietary Information
                  </label>
                  <input
                    type="text"
                    name="dietaryInfo"
                    id="dietaryInfo"
                    value={formData.dietaryInfo}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Vegetarian, Vegan, Halal, Kosher"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergens (if any)
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {commonAllergens.map(allergen => (
                      <label key={allergen} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.allergens.includes(allergen)}
                          onChange={() => handleAllergenToggle(allergen)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {allergen}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="storageInstructions" className="block text-sm font-medium text-gray-700">
                    Storage Instructions
                  </label>
                  <textarea
                    name="storageInstructions"
                    id="storageInstructions"
                    rows={2}
                    value={formData.storageInstructions}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Keep refrigerated, Store in cool dry place"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Food Images</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-primary-600 hover:text-primary-500 font-medium">
                        Upload images
                      </span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </label>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF up to 5MB each. Maximum 5 images.
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt="Food preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder={user.phone || "Your phone number"}
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    id="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder={user.email || "Your email address"}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button - Hidden */}
            <div className="hidden">
              <button type="button">Cancel</button>
              <button type="submit">Create Donation</button>
            </div>
          {/* End of hidden form */}

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <FaInfoCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Tips for a successful donation</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide clear, accurate descriptions of your food items</li>
                  <li>Include any dietary restrictions or allergen information</li>
                  <li>Set realistic pickup times and be available for coordination</li>
                  <li>Ensure food is safe and properly stored before donation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <FaInfoCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Tips for a successful donation</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide clear, accurate descriptions of your food items</li>
                  <li>Include any dietary restrictions or allergen information</li>
                  <li>Set realistic pickup times and be available for coordination</li>
                  <li>Ensure food is safe and properly stored before donation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDonation;
