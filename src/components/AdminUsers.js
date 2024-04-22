import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from './Admin.module.css'
import axios from 'axios';
import { useUser } from './UserContext';
import UserEditForm from './UserEditForm';
import { set } from 'mongoose';
import AddUserForm from './AddUserForm';


const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [editingUsername, setEditingUsername] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const[clickAdd, setClickAdd]=useState(false);
    const { user, reservationTrigger, triggerReservationUpdate } = useUser();



    useEffect(() => {
        let isMounted = true; 
        if (user && user.role==="admin") {
            axios.get('http://localhost:3001/users')
            .then(response => {
                    console.log("Fetched users", response.data);
                    setUsers(response.data);
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


  const handleEdit = (username) => {
    console.log("selected user:", username)
    setEditingUsername(username);
    };

    const handleDelete = (username) => {
        console.log("this is my username: ", username)
        console.log("no don't delete me pls!")
        if (window.confirm(`Are you sure you want to delete ${username}?`)) {
            axios.delete(`http://localhost:3001/users/${username}`)
                .then(() => {
                    alert('User deleted successfully');
                    setUsers(users.filter(user => user.username !== username));
                })
                .catch(error => {
                    console.error('Failed to delete user:', error);
                    alert('Failed to delete user. Please try again later.');
                });
        }
    };

    const handleAddClick = () => {
        setClickAdd(!clickAdd); 
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

  return(

    <div className={styles.userListContainer}>
        <div className={styles.headerContainer}>
            <h2>User List:</h2>
            <button className={styles.addButton} onClick={handleAddClick}>+</button>
        </div>
        {clickAdd && <AddUserForm />}

        <ul>
            {users.map((user, index) => (
                <li key={index}>
                Username: {user.username}, Role: {user.role}
                <div className={styles.buttonContainer}>
                            <button className={styles.editButton} onClick={() => handleEdit(user.username)}>Edit</button>
                            <button className={styles.deleteButton} onClick={() => handleDelete(user.username)}>Delete</button>
                </div>
                {editingUsername === user.username && (
                    <UserEditForm user={user} onUpdate={setEditingUsername} /> 
                )}
                </li>
            ))}
        </ul>
    </div>
  );

    
};

export default AdminUsers;