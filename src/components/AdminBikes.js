import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import styles from './Admin.module.css'
import { useUser } from './UserContext';
import BikeEditForm from './BikeEditForm';
import AddBikeForm from './AddBikeForm';

const AdminBikes = () => {
    const [bikes, setBikes] = useState([]);
    const [editBikeId,setEditBikeId]=useState(null);
    const { user, reservationTrigger, triggerReservationUpdate } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const[clickAdd, setClickAdd]=useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true; 
        if (user && user.username) {
            axios.get('http://localhost:3001/bikes')
            .then(response => {
                    console.log("Fetched bikes", response.data);
                    setBikes(response.data);
                    setIsLoading(false);

            })
            .catch(error => {
                console.error('oops caught you:', error);
                setIsLoading(false);
            });        
        }else{
            setError('User not logged in');
            setIsLoading(false);

        }
    }, [user, reservationTrigger]);

    const handleEdit = (bikeId) => {
        setEditBikeId(bikeId);
    };

    const handleDelete = (id) => {
        console.log("this is my id: ", id)
        console.log("no don't delete me pls!")
        axios.delete(`http://localhost:3001/bikes/${id}`)
            .then(() => {
                alert('Bike deleted successfully');
                setBikes(bikes => bikes.filter(bike => bike._id !== id));
            })
            .catch(error => {
                console.error('Failed to delete bike:', error);
                alert('Failed to delete bike. Please try again later.');
            });
    };

    const handleAddClick = () => {
        setClickAdd(!clickAdd); // Toggle the visibility of the add form
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return(
        <div className={styles.bikeContainer}>
        <div className={styles.headerContainer}>
          <h2>Current Bikes:</h2>
          <button className={styles.addButton} onClick={handleAddClick}>+</button>
        </div>
        {clickAdd && <AddBikeForm />}

    {bikes.map(bike => (
            <div key={bike._id} className={styles.bikeCard}>
                <h4>{bike.model} - {bike.color}</h4>
                <img src={bike.imageUrl} alt={bike.model} className={styles.bikeImage}/>
                <p>Location: {bike.location}</p>
                <p>Available: {bike.available ? 'Yes' : 'No'}</p>
                <p>Average Rating: {bike.averageRating || 'Not Rated'}</p>
                <ul>
                  {bike.ratings.map((rating) => (
                    <li key={rating._id}>User ID: {rating.user.$oid}, Rating: {rating.rating}</li>
                  ))}
                </ul>
                <div className={styles.buttonContainer}>
                    <button className={styles.editButton} onClick={() => handleEdit(bike._id)} >Edit</button>
                    <button className={styles.deleteButton} onClick={() => handleDelete(bike._id)}>Delete</button>
                </div>
                {editBikeId === bike._id && (
                    <BikeEditForm bike={bike} onUpdate={setEditBikeId} /> 
                )}
            </div>
        ))}
    </div>
    );

};

export default AdminBikes;