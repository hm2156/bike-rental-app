import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AuthForm.module.css';
import Header from './Header';

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/signup', { username, password });
      navigate('/');
    } catch (error) {
      console.error('Signup failed:', error.response ? error.response.data.message : 'No response from server');
    }
  };

  return (
    <>
    <Header />
    <div className={styles.container}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp} className={styles.form}>
        <label className={styles.label}>
          Username:
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className={styles.input} />
        </label>
        <label className={styles.label}>
          Password:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} />
        </label>
        <button type="submit" className={styles.button}>Sign Up</button>
        <button type="button" onClick={() => navigate('/')} className={styles.button}>Back to Login</button>
      </form>
    </div>
    </>
  );
}

export default SignUp;
