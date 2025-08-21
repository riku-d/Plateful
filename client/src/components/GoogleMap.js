import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const GoogleMap = ({ pickupLocation, deliveryLocation, onRouteCalculated }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Load Google Maps API
  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    googleMapScript.async = true;
    googleMapScript.defer = true;
    googleMapScript.onload = () => setIsLoaded(true);
    googleMapScript.onerror = () => {
      setError('Failed to load Google Maps API. Please try again later.');
      toast.error('Failed to load Google Maps API. Please try again later.');
    };

    document.body.appendChild(googleMapScript);

    return () => {
      document.body.removeChild(googleMapScript);
    };
  }, []);

  // Initialize map when API is loaded
  useEffect(() => {
    if (!isLoaded || !pickupLocation || error) return;

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { 
          lat: pickupLocation.coordinates.lat, 
          lng: pickupLocation.coordinates.lng 
        },
        zoom: 14,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      });

      const directionsServiceInstance = new window.google.maps.DirectionsService();
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: false,
      });

      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);

      // Add marker for pickup location
      new window.google.maps.Marker({
        position: { 
          lat: pickupLocation.coordinates.lat, 
          lng: pickupLocation.coordinates.lng 
        },
        map: mapInstance,
        title: 'Pickup Location',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        },
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Error initializing map. Please try again later.');
      toast.error('Error initializing map. Please try again later.');
    }
  }, [isLoaded, pickupLocation, error]);

  // Calculate route when delivery location is set
  useEffect(() => {
    if (!isLoaded || !map || !directionsService || !directionsRenderer || !pickupLocation || !deliveryLocation) {
      return;
    }

    const origin = { 
      lat: pickupLocation.coordinates.lat, 
      lng: pickupLocation.coordinates.lng 
    };
    
    const destination = { 
      lat: deliveryLocation.coordinates.lat, 
      lng: deliveryLocation.coordinates.lng 
    };

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
          
          // Extract route information
          const route = result.routes[0];
          if (route && route.legs && route.legs[0]) {
            const leg = route.legs[0];
            const routeInfo = {
              distance: leg.distance.text,
              duration: leg.duration.text,
              durationValue: leg.duration.value, // in seconds
            };
            
            // Pass route information to parent component
            if (onRouteCalculated) {
              onRouteCalculated(routeInfo);
            }
          }
        } else {
          console.error('Directions request failed due to', status);
          toast.error('Failed to calculate route. Please try again.');
        }
      }
    );
  }, [isLoaded, map, directionsService, directionsRenderer, pickupLocation, deliveryLocation, onRouteCalculated]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-md">
      {!isLoaded ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full" />
      )}
    </div>
  );
};

export default GoogleMap;