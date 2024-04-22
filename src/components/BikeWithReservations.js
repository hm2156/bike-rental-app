import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './BikesWithReservations.module.css'

const BikesWithReservations = () => {
    const [bikesWithReservations, setBikesWithReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get('http://localhost:3001/bikesWithReservations')
            .then(response => {
                setBikesWithReservations(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                setError('Failed to fetch bikes with reservations');
                setIsLoading(false);
            });
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Bikes and their Reservations</h2>
            {bikesWithReservations.map((bike) => (
                <div key={bike._id} className={styles.bikeCard}>
                    <h3 className={styles.bikeTitle}>{bike.model}</h3>
                    {/* <img src={bike.imageUrl} alt={bike.model} style={{ width: '50px' }} /> */}
                    <h4 className={styles.reservationsTitle}>Reserved by:</h4>
                    {bike.reservations.map((res, index) => (
                        <p key={index} className={styles.reservationDetails}>
                            {res.user} reserved on {res.date} for {res.timeSlot}.
                        </p>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default BikesWithReservations;
