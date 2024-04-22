import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import './CurrentReservations.css'

const CurrentReservations = () => {
    const { user, reservationTrigger } = useUser();
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && user.username) {
            setIsLoading(true);
            axios.get(`http://localhost:3001/userReservations?username=${user.username}`)
                .then(response => {
                    console.log("Current reservations server response: ", response.data)
                    setReservations(response.data);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching reservations:', error);
                    setError('Failed to fetch reservations');
                    setIsLoading(false);
                });
        } else {
            setError('User not logged in');
            setIsLoading(false);
        }
    }, [user, reservationTrigger]);

    const handleCancel = (reservationId) => {
        if (!user || !user.username) {
            alert("You must be logged in to cancel reservations.");
            return;
        }
    
        axios.post(`http://localhost:3001/cancel`, { reservationId , username: user.username})
            .then(response => {
                alert('Reservation cancelled successfully!');
      
                setReservations(prevReservations => 
                    prevReservations.filter(reservation => reservation._id !== reservationId)
                );
            })
            .catch(error => {
                console.error('Error cancelling reservation:', error);
                alert('Failed to cancel the reservation. Please try again later.');
            });
    };
    

    const handleRateBike = async (bikeId) => {
        const rating = prompt('Enter your rating (1-5):');
        if (!rating || rating < 1 || rating > 5) {
          alert('Invalid rating. Please enter a number between 1 and 5.');
          return;
        }
      
        try {
            console.log({
                bikeId,
                rating: Number(rating),
                username: user.username
              })
          const response = await axios.post('http://localhost:3001/rate', {
            bikeId,
            rating: Number(rating),
            username: user.username
          });
          alert(`Rating submitted! New Average Rating: ${response.data.averageRating}`);

        } catch (error) {
          console.error('Error submitting rating:', error);
          alert('Failed to submit rating. Please try again later.');
        }
      };

      
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (reservations.length === 0) return <div>No reservations found.</div>;

    return (
        <div className="reservations-container">
            {reservations.map(reservation => (
                <div key={reservation._id} className="reservation-card">
                    <h4>{reservation.bike.model}</h4>
                    {/* <img src={reservation.bike.imageUrl} alt={reservation.bike.model} /> */}
                    <p>Date: {reservation.date}</p>
                    <p>Time Slot: {reservation.timeSlot}</p>
                    <div className='buttons'>
                    <button onClick={() => handleCancel(reservation._id)} className="cancel-btn">Cancel Reservation</button>
                    <button onClick={() => handleRateBike(reservation.bike._id)} className="rate-btn">Rate Bike</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CurrentReservations;
