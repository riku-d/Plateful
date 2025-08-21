import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const EventReminder = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [showReminder, setShowReminder] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  useEffect(() => {
    if (user) {
      // In a real app, this would fetch from a calendar API
      // For now, we'll simulate with mock data
      const mockEvents = [
        {
          id: '1',
          title: 'Department Seminar',
          date: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
          location: 'Main Hall',
          type: 'seminar',
          expectedAttendees: 50
        },
        {
          id: '2',
          title: 'Tech Fest',
          date: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
          location: 'Campus Grounds',
          type: 'fest',
          expectedAttendees: 200
        },
        {
          id: '3',
          title: 'Workshop on Sustainability',
          date: new Date(Date.now() + 1000 * 60 * 60 * 48), // 2 days from now
          location: 'Engineering Block',
          type: 'workshop',
          expectedAttendees: 30
        }
      ];

      setUpcomingEvents(mockEvents);

      // Check for events that are about to happen or just ended
      const checkForEventReminders = () => {
        const now = new Date();
        
        mockEvents.forEach(event => {
          const eventTime = new Date(event.date);
          const timeDiff = eventTime - now;
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          // Remind about upcoming events (1-2 hours before)
          if (hoursDiff > 0 && hoursDiff <= 2) {
            setCurrentEvent(event);
            setShowReminder(true);
          }
          
          // Remind about logging food after event (0-1 hours after)
          if (hoursDiff < 0 && hoursDiff >= -1) {
            addNotification({
              type: 'event',
              title: 'Food Logging Reminder',
              message: `Don't forget to log any surplus food from "${event.title}" event!`,
            });
          }
        });
      };
      
      // Initial check
      checkForEventReminders();
      
      // Set up interval to check periodically
      const intervalId = setInterval(checkForEventReminders, 15 * 60 * 1000); // Check every 15 minutes
      
      return () => clearInterval(intervalId);
    }
  }, [user, addNotification]);

  const handleCreateDonation = () => {
    // Navigate to donation creation form with pre-filled event info
    window.location.href = `/donations/create?event=${encodeURIComponent(currentEvent.title)}&location=${encodeURIComponent(currentEvent.location)}`;
    dismissReminder();
  };

  const dismissReminder = () => {
    setShowReminder(false);
    setCurrentEvent(null);
  };

  const formatEventTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {showReminder && currentEvent && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-green-200">
          <div className="bg-green-600 text-white px-4 py-2 flex justify-between items-center">
            <h3 className="font-medium text-sm">Upcoming Event Reminder</h3>
            <button onClick={dismissReminder} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <div className="mb-3">
              <h4 className="font-semibold text-gray-800">{currentEvent.title}</h4>
              <p className="text-sm text-gray-600">
                Today at {formatEventTime(currentEvent.date)} • {currentEvent.location}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Expected attendees: {currentEvent.expectedAttendees}
              </p>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Will there be surplus food after this event? Plan ahead to share it with the community!
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={handleCreateDonation}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded"
              >
                Create Food Listing
              </button>
              <button 
                onClick={dismissReminder}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-2 px-3 rounded"
              >
                Remind Me Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventReminder;