// src/components/BikeList.js
import React, { useState, useEffect, useMemo} from 'react';
import BikeItem from './BikeItem';
import axios from 'axios';
import styles from './BikeList.module.css';
import Header from './Header';
import { useNavigate } from 'react-router-dom'; 
import { useUser } from './UserContext';
import CurrentReservations from './CurrentReservations';




const BikeList = () => {
  const [modelFilter, setModelFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [bikes, setBikes] = useState([]);
  // const[filteredBikes, setFilteredBikes]=useState([]);
  const navigate = useNavigate();
  const { user, points } = useUser();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];  
  });

  useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        axios.get('http://localhost:3001/bikes')
            .then(response => {
                console.log("bikelist fetched from server", response.data)
                setBikes(response.data);
            })
            .catch(error => {
                console.error('Failed to fetch bikes:', error);
            });
    }, [navigate, user]);

    


  const handleReserve = (bikeId, isReserved) => {
    setBikes(prevBikes =>
      prevBikes.map(bike => 
        bike._id === bikeId ? { ...bike, isReserved } : bike
      )
    );
  };




const filteredBikes = useMemo(() => {
  console.log("bikes before filtering", bikes)
  const filtered_bikes = bikes.filter(bike => {
    let meetsRatingCriteria = true; 

    if (ratingFilter === "Unrated") {
      meetsRatingCriteria = bike.ratings.length === 0; 
    } else if (parseInt(ratingFilter)) {
      const bikeRating = Math.round(bike.averageRating); 
      meetsRatingCriteria = parseInt(ratingFilter) === bikeRating; 
    }
    return (modelFilter ? bike.model === modelFilter : true) &&
      (colorFilter ? bike.color === colorFilter : true) &&
      (locationFilter ? bike.location === locationFilter : true) &&
      (selectedDate ? bike.availability.includes(selectedDate) : true) 
      && meetsRatingCriteria
  })
  console.log("filtered bikes",filtered_bikes)
  return filtered_bikes ;
}, [bikes, modelFilter, colorFilter, locationFilter, ratingFilter, selectedDate]);



  const uniqueOptions = (key) => {
    const items = bikes.map(bike => key === 'rating' ? Math.floor(bike[key]).toString() : bike[key]);
    const unique = [...new Set(items)];
    unique.sort();
    return unique;
  };
  
  const handleLogout = async () => {
    try {

        await axios.post('http://localhost:3001/logout');
        
        
        localStorage.clear(); 
        
        navigate('/');
    } catch (error) {
        console.error('Logout failed:', error);
      
    }
};

  return (

    <div>
      <Header />
      <div className={styles.filterContainer}>
      <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      <input
          type="date"
          value={selectedDate}
          className={styles.datepicker}
          onChange={e => setSelectedDate(e.target.value)}
        />
        <select className={styles.dropdown} value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
          <option value="">Filter by model</option>
          {uniqueOptions('model').map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <select className={styles.dropdown} value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}>
          <option value="">Filter by color</option>
          {uniqueOptions('color').map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <select className={styles.dropdown} value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">Filter by location</option>
          {uniqueOptions('location').map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <select className={styles.dropdown} value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
          <option value="">All Ratings</option>
          <option value="Unrated">Unrated</option>
          {[1, 2, 3, 4, 5].map(rating => (
            <option key={rating} value={rating}>{rating} Stars</option>
          ))}
        </select>


      </div>

          <div className={styles.allContainer}>
      <div className={styles.reservationsContainer}>
        <h3>Your Reservations:</h3>
        <CurrentReservations />
      </div>
      <div className={styles.availableBikesContainer}>
        <h3 className={styles.title}>Available Bikes:</h3>
        <div className={styles.bikeListContainer}>
          {filteredBikes.map(bike => (
            <BikeItem
              key={bike._id}
              bike={bike}
              selectedDate={selectedDate}
              onReserve={handleReserve}
            />
          ))}
        </div>
      </div>
    </div>

    </div>
  );
};

export default BikeList;
