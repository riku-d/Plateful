import React from 'react';

const FoodSafetyTag = ({ expirationDate, isRefrigerated, isFrozen }) => {
  // Calculate hours remaining until expiration
  const calculateHoursRemaining = () => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffMs = expiry - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours;
  };

  const hoursRemaining = calculateHoursRemaining();

  // Determine safety status
  const getSafetyStatus = () => {
    if (hoursRemaining <= 0) {
      return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' };
    } else if (hoursRemaining <= 4) {
      return { status: 'critical', label: 'Consume ASAP', color: 'bg-orange-100 text-orange-800' };
    } else if (hoursRemaining <= 12) {
      return { status: 'warning', label: `Safe for ${hoursRemaining} hours`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'safe', label: `Safe for ${hoursRemaining} hours`, color: 'bg-green-100 text-green-800' };
    }
  };

  const safety = getSafetyStatus();

  // Get storage recommendations
  const getStorageRecommendation = () => {
    if (isFrozen) {
      return 'Keep frozen until ready to use';
    } else if (isRefrigerated) {
      return 'Keep refrigerated';
    } else {
      return 'Store at room temperature';
    }
  };

  return (
    <div className="mb-4">
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${safety.color} mb-2`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {safety.label}
      </div>
      
      <div className="text-sm text-gray-600">
        <p className="flex items-center mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {getStorageRecommendation()}
        </p>
        <p className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Expires: {new Date(expirationDate).toLocaleDateString()} at {new Date(expirationDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
      </div>
    </div>
  );
};

export default FoodSafetyTag;