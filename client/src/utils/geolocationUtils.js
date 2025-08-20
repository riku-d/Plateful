/**
 * Utility functions for handling geolocation
 */

/**
 * Get the user's current location using the browser's Geolocation API
 * @returns {Promise<{lat: number, lng: number}>} A promise that resolves to the user's coordinates
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ lat: latitude, lng: longitude });
      },
      (error) => {
        let errorMessage = 'Unknown error occurred while retrieving location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

/**
 * Get address details from coordinates using Google Maps Geocoding API
 * @param {Object} coordinates - The coordinates object with lat and lng properties
 * @returns {Promise<Object>} A promise that resolves to the address details
 */
export const getAddressFromCoordinates = async (coordinates) => {
  try {
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps API not loaded');
    }

    const geocoder = new window.google.maps.Geocoder();
    const response = await new Promise((resolve, reject) => {
      geocoder.geocode({ location: coordinates }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });

    const addressComponents = response[0].address_components;
    const formattedAddress = response[0].formatted_address;

    // Extract address components
    let street = '';
    let city = '';
    let state = '';
    let zipCode = '';

    addressComponents.forEach(component => {
      const types = component.types;

      if (types.includes('street_number')) {
        street = component.long_name;
      } else if (types.includes('route')) {
        street = street ? `${street} ${component.long_name}` : component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    return {
      street,
      city,
      state,
      zipCode,
      formattedAddress,
      coordinates
    };
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    throw error;
  }
};

/**
 * Get coordinates from an address string using Google Maps Geocoding API
 * @param {string} address - The address string to geocode
 * @returns {Promise<{lat: number, lng: number}>} A promise that resolves to the coordinates
 */
export const getCoordinatesFromAddress = async (address) => {
  try {
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps API not loaded');
    }

    const geocoder = new window.google.maps.Geocoder();
    const response = await new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });

    const location = response[0].geometry.location;
    return { lat: location.lat(), lng: location.lng() };
  } catch (error) {
    console.error('Error getting coordinates from address:', error);
    throw error;
  }
};