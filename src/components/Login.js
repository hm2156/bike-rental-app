import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; 
import axios from 'axios';
import styles from './AuthForm.module.css';
import Header from './Header';


function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useUser();
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
    
        try {
          const response = await axios.post('http://localhost:3001/login', { username, password });
          if (response.data && response.data.role) {
            setUser({ username: response.data.username, role: response.data.role })

            if (response.data.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/bikelist'); 
            }
          }
        } catch (error) {
          console.error('Login failed:', error.response ? error.response.data.message : 'No response from server');
          alert('Login failed: ' + (error.response ? error.response.data.message : 'No response from server'));
        }
      };


  return (
    <>
      <Header />

      <h3 className={styles.title}> Welcome Back </h3>
      <div className={styles.container}>
        <h2>Login</h2>
        <form onSubmit={handleLogin} className={styles.form}>
          <label className={styles.label}>
            Username:
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className={styles.input} />
          </label>
          <label className={styles.label}>
            Password:
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} />
          </label>
          <button type="submit" className={styles.button}>Login</button>
          <button type="button" onClick={() => navigate('/signup')} className={styles.button}>Sign Up</button>
        </form>
      </div>
    </>
  );
}

export default Login;
