import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import styles from './BikeEditForm.module.css'

const BikeEditForm = ({ bike, onUpdate }) => {
  const [model, setModel] = useState(bike.model);
  const [color, setColor] = useState(bike.color);
  const [location, setLocation] = useState(bike.location);
  const [imageUrl, setImageUrl] = useState(bike.imageUrl);
  const [availability, setAvailability] = useState(bike.availability.join(', '));
  const { triggerReservationUpdate , reservationTrigger} = useUser();

  const handleSubmit = async (event) => {
     event.preventDefault();
    console.log("you clicked submit")
    console.log("youre changes", {
        model,
        color,
        location,
        imageUrl,
        availability: availability.split(', ').map(date => date.trim()),
      })

    try {
      const response = await axios.put(`http://localhost:3001/bikes/${bike._id}`, {
        model,
        color,
        location,
        imageUrl,
        availability: availability.split(', ').map(date => date.trim()),
      });

      onUpdate(response.data); // Trigger an update in the parent component
      console.log('Before update:', reservationTrigger);
       triggerReservationUpdate();
       console.log('After update:', reservationTrigger);

      alert('Bike updated successfully!');
      
    } catch (error) {
      console.error('Error updating bike:', error);
      alert('Failed to update bike. Please try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <label className={styles.formLabel}>
        Model:
        <input type="text" value={model} onChange={e => setModel(e.target.value)} />
      </label>
      <label className={styles.formLabel}>
        Color:
        <input type="text" value={color} onChange={e => setColor(e.target.value)} />
      </label>
      <label className={styles.formLabel}>
        Location:
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} />
      </label>
      <label className={styles.formLabel}>
        Image URL:
        <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      </label>
      <label className={styles.formLabel}>
        Availability (comma-separated dates):
        <input type="text" value={availability} onChange={e => setAvailability(e.target.value)} />
      </label>
      <button type="submit" className={styles.submitButton}>Update Bike</button>
    </form>
  );
};

export default BikeEditForm;
