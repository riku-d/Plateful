import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    foodSaved: 0,
    carbonFootprint: 0,
    waterFootprint: 0,
    peopleFed: 0,
    donationsCompleted: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year'

  useEffect(() => {
    // Simulate fetching analytics data
    // In a real app, this would be an API call
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // This would be replaced with actual API call
        // const response = await axios.get(`/api/analytics?timeframe=${timeframe}`);
        // setStats(response.data);
        
        // Simulated data for now
        setTimeout(() => {
          // Generate different data based on timeframe
          let multiplier = 1;
          if (timeframe === 'month') multiplier = 4;
          if (timeframe === 'year') multiplier = 12;
          
          setStats({
            foodSaved: 125 * multiplier, // in kg
            carbonFootprint: 250 * multiplier, // in kg CO2
            waterFootprint: 15000 * multiplier, // in liters
            peopleFed: 75 * multiplier,
            donationsCompleted: 30 * multiplier
          });
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Failed to fetch analytics data', err);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-700 mb-2">Environmental Impact Dashboard</h1>
      <p className="text-gray-600 mb-8">Track the positive impact of food sharing on our community and environment</p>
      
      {/* Timeframe selector */}
      <div className="flex space-x-4 mb-8">
        <button 
          onClick={() => handleTimeframeChange('week')} 
          className={`px-4 py-2 rounded-md ${timeframe === 'week' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          This Week
        </button>
        <button 
          onClick={() => handleTimeframeChange('month')} 
          className={`px-4 py-2 rounded-md ${timeframe === 'month' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          This Month
        </button>
        <button 
          onClick={() => handleTimeframeChange('year')} 
          className={`px-4 py-2 rounded-md ${timeframe === 'year' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          This Year
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Food Saved Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Food Saved</p>
                <h3 className="text-2xl font-bold">{formatNumber(stats.foodSaved)} kg</h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">That's equivalent to {formatNumber(Math.round(stats.foodSaved * 2.5))} meals!</p>
          </div>

          {/* Carbon Footprint Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Carbon Footprint Avoided</p>
                <h3 className="text-2xl font-bold">{formatNumber(stats.carbonFootprint)} kg CO₂</h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Equivalent to taking {formatNumber(Math.round(stats.carbonFootprint / 4))} cars off the road for a day</p>
          </div>

          {/* Water Footprint Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-cyan-100 text-cyan-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Water Footprint Avoided</p>
                <h3 className="text-2xl font-bold">{formatNumber(stats.waterFootprint)} L</h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">That's {formatNumber(Math.round(stats.waterFootprint / 150))} showers worth of water!</p>
          </div>

          {/* People Fed Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">People Fed</p>
                <h3 className="text-2xl font-bold">{formatNumber(stats.peopleFed)}</h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Making a difference in our community, one meal at a time</p>
          </div>

          {/* Donations Completed Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Donations Completed</p>
                <h3 className="text-2xl font-bold">{formatNumber(stats.donationsCompleted)}</h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Successfully connected donors with recipients</p>
          </div>

          {/* Tips Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-lg mb-3">Tips to Reduce Food Waste</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Plan meals and make shopping lists
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Store food properly to extend freshness
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Learn about expiration vs. best-by dates
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Get creative with leftovers
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;