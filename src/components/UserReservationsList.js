import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './UserReservationsList.module.css'

const UserReservationsList = () => {
    const [userReservations, setUserReservations] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:3001/allUserReservations')
            .then(response => {
                setUserReservations(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching user reservations:', error);
                setError('Failed to fetch user reservations');
                setIsLoading(false);
            });
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.userReservationsContainer}>
            <h2 className={styles.userReservationsHeader}>All User Reservations</h2>
            {Object.keys(userReservations).length > 0 ? (
                Object.entries(userReservations).map(([username, reservations]) => (
                    <div key={username}>
                        <h3>{username}</h3>
                        <ul className={styles.userReservationList}>
                            {reservations.map((res, index) => (
                                <li key={index} className={styles.userReservationList}>
                                    <div className={styles.reservationDetail}>
                                        <img src={res.bike.imageUrl} alt={res.bike.model} />
                                        <div className={styles.reservationInfo}>
                                            <strong>{res.bike.model}</strong> on {res.date} during {res.timeSlot}.
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No reservations found.</p>
            )}
        </div>
    );
};

export default UserReservationsList;
