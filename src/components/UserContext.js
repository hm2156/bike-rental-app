import React, { createContext, useContext, useState } from 'react';

// Create a context
const UserContext = createContext();

// Provider component that wraps your app and provides the user object
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [reservationTrigger, setReservationTrigger] = useState(0); // New trigger

  const triggerReservationUpdate = () => {
      console.log("updating trigger")
      setReservationTrigger(prev => prev + 1); // Function to update the trigger
  };

  return (
    <UserContext.Provider value={{ user, setUser, reservationTrigger, triggerReservationUpdate }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use user context
export function useUser() {
  return useContext(UserContext);
}