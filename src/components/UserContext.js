import React, { createContext, useContext, useState } from 'react';


const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [reservationTrigger, setReservationTrigger] = useState(0); 

  const triggerReservationUpdate = () => {
      console.log("updating trigger")
      setReservationTrigger(prev => prev + 1); 
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