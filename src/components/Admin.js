import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Admin.module.css'
import { useNavigate } from 'react-router-dom'; 
import { useUser } from './UserContext';
import AdminBikes from './AdminBikes';
import AdminUsers from './AdminUsers';
import UserReservationsList from './UserReservationsList';
import BikesWithReservations from './BikeWithReservations';


const Admin = () => {

    const navigate = useNavigate();
    
    const handleLogout = () => {
        navigate('/'); 
      };
    
  
    return (
      <div>
        <header className={styles.header}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
        </header>
        
        <AdminUsers />
        < div className={styles.col}>
        <AdminBikes />
        <UserReservationsList />
        <BikesWithReservations />
        </div>
      </div>

    
    );
  };
  
export default Admin;
