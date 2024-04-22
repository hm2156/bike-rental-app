import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
const BikeReservations = () => {
    const [bikeReservations, setBikeReservations] = useState([]);

    useEffect(() => {
        const fetchBikeReservations = async () => {
            try {
                const response = await axios.get('http://localhost:3001/reservations/bikes');
                setBikeReservations(response.data);
            } catch (error) {
                console.error('Error fetching bike reservations:', error);
            }
        };
        fetchBikeReservations();
    }, []);

    return (
        <div>
            <h2>Reservations Per Bike</h2>
            {Object.entries(bikeReservations).map(([bikeId, reservations], index) => (
                <div key={index}>
                    <h3>Bike ID: {bikeId}</h3>
                    <ul>
                        {reservations.map((reservation, index) => (
                            <li key={index}>
                                User: {reservation.username}, Date: {reservation.date}, Time Slot: {reservation.timeSlot}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default BikeReservations;