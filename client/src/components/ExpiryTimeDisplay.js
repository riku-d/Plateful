import React, { useState, useEffect } from 'react';

const ExpiryTimeDisplay = ({ expiryTime, remainingMinutes, expiryStatus, source }) => {
  const [timeLeft, setTimeLeft] = useState(remainingMinutes);
  const [displayText, setDisplayText] = useState('');
  const [boxColor, setBoxColor] = useState('');

  useEffect(() => {
    if (!remainingMinutes || source !== 'foods') return;

    // Update time every minute
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1);
        
        // Update display text and color based on remaining time
        if (newTime <= 0) {
          setDisplayText('Expired');
          setBoxColor('bg-red-600');
        } else if (newTime <= 10) {
          setDisplayText(`${newTime} min`);
          setBoxColor('bg-red-600');
        } else if (newTime <= 30) {
          setDisplayText(`${newTime} min`);
          setBoxColor('bg-red-500');
        } else if (newTime <= 60) {
          setDisplayText(`${newTime} min`);
          setBoxColor('bg-blue-500');
        } else {
          const hours = Math.floor(newTime / 60);
          const mins = newTime % 60;
          if (hours > 0) {
            setDisplayText(`${hours}h ${mins}m`);
          } else {
            setDisplayText(`${mins}m`);
          }
          setBoxColor('bg-green-500');
        }
        
        return newTime;
      });
    }, 60000); // Update every minute

    // Initial setup
    if (remainingMinutes <= 0) {
      setDisplayText('Expired');
      setBoxColor('bg-red-600');
    } else if (remainingMinutes <= 10) {
      setDisplayText(`${remainingMinutes} min`);
      setBoxColor('bg-red-600');
    } else if (remainingMinutes <= 30) {
      setDisplayText(`${remainingMinutes} min`);
      setBoxColor('bg-red-500');
    } else if (remainingMinutes <= 60) {
      setDisplayText(`${remainingMinutes} min`);
      setBoxColor('bg-blue-500');
    } else {
      const hours = Math.floor(remainingMinutes / 60);
      const mins = remainingMinutes % 60;
      if (hours > 0) {
        setDisplayText(`${hours}h ${mins}m`);
      } else {
        setDisplayText(`${mins}m`);
      }
      setBoxColor('bg-green-500');
    }

    return () => clearInterval(interval);
  }, [remainingMinutes, source]);

  // Don't show for non-food donations
  if (source !== 'foods' || !remainingMinutes) return null;

  return (
    <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-white text-xs font-semibold ${boxColor} shadow-md`}>
      {displayText}
    </div>
  );
};

export default ExpiryTimeDisplay;
