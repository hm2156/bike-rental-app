import React, { useState } from 'react';
import axios from 'axios';
import styles from './UserEditForm.module.css'
import { useUser } from './UserContext';

const UserEditForm = ({ user, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [role, setRole] = useState(user.role);
  const { triggerReservationUpdate , reservationTrigger} = useUser();


  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("hi you edit this", { username, role } )
    try {
        const response = await axios.put(`http://localhost:3001/users/${user.username}`, {
            username,
            role
        });
        onUpdate(response.data);
        console.log('Before update:', reservationTrigger);
       triggerReservationUpdate();
       console.log('After update:', reservationTrigger);
        // console.log(response.data)
        alert('User updated successfully!');
          // Clear or refresh user editing state
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user. Please try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
      <label className={styles.label}>Username:</label>
        <input type="text" value={username}  className={styles.input} onChange={e => setUsername(e.target.value)} />
      </div>
      <div className={styles.inputGroup}>
      <label className={styles.label}>
        Role:
        </label>
        <select className={styles.select} value={role} onChange={e => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      
      </div>

      <button type="submit" className={styles.button}>Update User</button>
    </form>
  );
};

export default UserEditForm;
