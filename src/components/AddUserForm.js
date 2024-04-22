import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import styles from './AddUserForm.module.css'

const AddUserForm = () => {
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        role: 'user'  // Default role
    });
    const { triggerReservationUpdate , reservationTrigger} = useUser();
    const [showForm, setShowForm] = useState(true);

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("your new user", userData)
        try {
            const response = await axios.post('http://localhost:3001/users', userData);
            alert(`User added successfully as a ${userData.role}!`);
            triggerReservationUpdate()
            setShowForm(false)
            console.log(response.data);
            // Optionally clear form or handle further logic
            setUserData({ username: '', password: '', role: 'user' });
        } catch (error) {
            alert('Failed to add user. Please try again later.');
            console.error('Error adding user:', error);
        }
    };

    return (
        <div>
            {showForm ? (    <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
            <input
                name="username"
                value={userData.username}
                onChange={handleChange}
                placeholder="Username"
                className={styles.input}
                required
            />
            </div>
            
            <div className={styles.inputGroup}>
            <input
                name="password"
                type="password"
                value={userData.password}
                onChange={handleChange}
                placeholder="Password"
                className={styles.input}
                required
            />
            </div>
            <div className={styles.inputGroup}>
            <select name="role" value={userData.role}className={styles.select} onChange={handleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
            </div>
            <button type="submit" className={styles.button}>Add User</button>
        </form>) : " "}
        </div>
    
    );
};

export default AddUserForm;
