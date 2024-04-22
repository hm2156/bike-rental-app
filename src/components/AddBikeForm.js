import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import styles from './AddBikeForm.module.css'

const AddBikeForm = () => {
    const { triggerReservationUpdate , reservationTrigger} = useUser();
    const [showForm, setShowForm] = useState(true);
    const [bikeData, setBikeData] = useState({
        model: '',
        color: '',
        location: '',
        available: true,
        imageUrl: '',
        availability: [],
        timeSlots: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBikeData({ ...bikeData, [name]: value });
    };

    const handleAvailabilityChange = (e) => {
        // Handling availability as an array of dates
        const updatedAvailability = e.target.value.split(',').map(date => date.trim());
        setBikeData({ ...bikeData, availability: updatedAvailability });
    };

    const handleTimeSlotsChange = (e) => {
        const updatedTimeSlots = e.target.value.split(',').map(timeSlot => timeSlot.trim());
        setBikeData({ ...bikeData, timeSlots: updatedTimeSlots });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("new bike data",bikeData)
        try {
            const response = await axios.post('http://localhost:3001/bikes', bikeData);
            alert('Bike added successfully!');
            triggerReservationUpdate()
            setShowForm(false)
            console.log(response.data);
        } catch (error) {
            alert('Failed to add bike. Please try again later.');
            console.error('Error adding bike:', error);
        }
    };

    return (
        <div>
            {showForm ? (
                <form onSubmit={handleSubmit} className={styles.formContainer}>
                <input className={styles.formInput} name="model" value={bikeData.model} onChange={handleChange} placeholder="Model" />
                <input className={styles.formInput}name="color" value={bikeData.color} onChange={handleChange} placeholder="Color" />
                <input className={styles.formInput}name="location" value={bikeData.location} onChange={handleChange} placeholder="Location" />
                <input className={styles.formInput}name="imageUrl" value={bikeData.imageUrl} onChange={handleChange} placeholder="Image URL" />
                <input className={styles.formInput}name="availability" onChange={handleAvailabilityChange} placeholder="Availability (comma-separated dates)" />
                <input className={styles.formInput}name="timeSlots" onChange={handleTimeSlotsChange} placeholder="Time Slots (e.g., 09:00-11:00, 11:00-13:00)" />
                <button className={styles.submitButton} type="submit">Add Bike</button>
            </form>
            ): " "}
            
        </div>
    );
};

export default AddBikeForm;
