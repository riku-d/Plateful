import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const AddressAutocomplete = ({ onAddressSelect, placeholder = 'Enter your address' }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Google Places Autocomplete when the component mounts
  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete();
      setIsLoaded(true);
      return;
    }

    // If not loaded, check if the script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
    if (existingScript) {
      // If script is loading, wait for it to load
      existingScript.addEventListener('load', () => {
        initAutocomplete();
        setIsLoaded(true);
      });
      return;
    }

    // If script is not loading, load it
    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    googleMapScript.async = true;
    googleMapScript.defer = true;
    googleMapScript.onload = () => {
      initAutocomplete();
      setIsLoaded(true);
    };
    googleMapScript.onerror = () => {
      toast.error('Failed to load Google Maps API. Please try again later.');
    };

    document.body.appendChild(googleMapScript);

    return () => {
      // Clean up only if we added the script
      if (!existingScript) {
        const script = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
        if (script) {
          document.body.removeChild(script);
        }
      }
    };
  }, []);

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    // Create the autocomplete object
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'in' }, // Restrict to India
      fields: ['address_components', 'formatted_address', 'geometry']
    });

    // Add listener for place changed event
    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();

    if (!place.geometry) {
      toast.error('Please select an address from the dropdown');
      return;
    }

    const addressComponents = place.address_components;
    let street = '';
    let city = '';
    let state = '';
    let zipCode = '';

    // Extract address components
    addressComponents.forEach(component => {
      const types = component.types;

      if (types.includes('street_number')) {
        street = component.long_name;
      } else if (types.includes('route')) {
        street = street ? `${street} ${component.long_name}` : component.long_name;
      } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
        // For Indian addresses, sublocality is often the neighborhood
        street = street ? `${street}, ${component.long_name}` : component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    // If street is still empty, use the formatted address
    if (!street) {
      street = place.formatted_address.split(',')[0];
    }

    const coordinates = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    const addressData = {
      street,
      city,
      state,
      zipCode,
      formattedAddress: place.formatted_address,
      coordinates
    };

    // Pass the address data to the parent component
    if (onAddressSelect) {
      onAddressSelect(addressData);
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        disabled={!isLoaded}
      />
      {!isLoaded && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-primary-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;