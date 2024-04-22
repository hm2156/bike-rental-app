import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './BikeItem.module.css';
import { useUser } from './UserContext';




const BikeItem = ({ bike, selectedDate, onReserve }) => {
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(''); 
  const [rating, setRating] = useState(1); // Default rating
  const [hasRated, setHasRated] = useState(false);
  const [isReserved, setIsReserved] = useState(bike.isReserved); 
  const [availableSlots, setAvailableSlots] = useState([]);
  const { user, triggerReservationUpdate } = useUser(); 
  const [lastUpdated, setLastUpdated] = useState(Date.now());



  useEffect(() => {
    if (selectedDate && bike._id) {
      console.log("hi")
        axios.get(`http://localhost:3001/availableSlots?bikeId=${bike._id}&date=${selectedDate}`)
            .then(response => {
                setAvailableSlots(response.data.slots);
            })
            .catch(error => console.error('Error fetching available slots:', error));
    }
}, [selectedDate, bike._id, lastUpdated]);



  const handleReserve = async () => {
    if (!selectedTimeSlot) {
        alert('Please select a time slot.');
        return;
    }
    if (!user) {
        alert('You must be logged in to make a reservation.');
        return;
    }

    try {
        const response = await axios.post('http://localhost:3001/reserve', {
            bikeId: bike._id,
            date: selectedDate,
            timeSlot: selectedTimeSlot,
            username: user.username
        });
        alert(response.data.message);
        onReserve(bike._id, true); 
        setShowTimeSlots(false); 
        triggerReservationUpdate()
        setLastUpdated(Date.now());
    } catch (error) {
        alert('Failed to reserve the bike. Please try again later.');
        console.error('Reservation error:', error);
    }
};

  const handleCancel = async () => {
    if (!selectedTimeSlot) {
      alert('No time slot selected. Please select a time slot before cancelling.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/cancel', {
        bikeId: bike._id,
        date: selectedDate,
        timeSlot: selectedTimeSlot
      });
      alert(response.data.message);
      onReserve(bike._id, false); 
    } catch (error) {
      console.error('Error cancelling the reservation:', error);
      alert('Failed to cancel the reservation. Please try again later.');
    }
  };
  
  


  return (
    <div className={styles.card}>
      <img src={bike.imageUrl} alt={`${bike.model}`} className={styles.bikeImage} />

      <div className={styles.details}>

     
        <h3 className={styles.model}>{bike.model}</h3>

        <p className={styles.location}>{bike.color}</p>
        <p className={styles.location}>{bike.location}</p>
        <button onClick={() => setShowTimeSlots(!showTimeSlots)}>
                    Reserve
                </button>
                {showTimeSlots && (
                    <>
                        <select onChange={(e) => setSelectedTimeSlot(e.target.value)} value={selectedTimeSlot}>
                            <option value="">Select a time slot</option>
                            {availableSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                        <button onClick={handleReserve}>Confirm Reservation</button>
                    </>
                )}

        {isReserved && !showTimeSlots &&(
          <>
            <button className={styles.button} onClick={handleCancel}>Cancel Reservation</button>
            {!hasRated && (
              <div>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className={styles.dropdown} >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <button>Submit Rating</button>
              </div>
            )}
          </>
        )}

      </div>
                
    </div>
  );
};

export default BikeItem;
