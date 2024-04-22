# Bike Rental Application

This React-based application is designed to manage bike rentals, featuring user roles for Managers and Users. Managers can manage bike and user data, while Users can reserve bikes, view bike availability, and rate them. This project utilizes the MERN stack (MongoDB, Express.js, React, and Node.js) for a full-stack JavaScript solution.

## Technology Stack

- **Frontend**: React (bootstrapped with Create React App)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **State Management**: React Context for state management across components

## Getting Started

### Prerequisites

Ensure you have Node.js and npm (Node Package Manager) installed on your system. You can download and install them from [https://nodejs.org/](https://nodejs.org/).

### Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/bike-rental-app.git
cd bike-rental-app
```

# Backend Setup for Bike Rental Application

## Initial Setup

Before running the backend server for the first time, you must set up your MongoDB database with initial data. This project uses a seed script to populate the database with bike data.

### Seeding the Database

1. Navigate to the backend directory:

   ```bash
   cd backend
   ``
Run the seed script to populate your MongoDB database with initial bike data. This step is crucial as it sets up the necessary data structures and populates them with default values, ensuring that the application functions correctly from the start.
```bash
node seed.js
```
Note: This script needs to be run only once before you start your server for the first time or whenever you want to reset your database to its initial state.

### Starting the Backend Server
After seeding the database, you can start the backend server:

Still within the backend directory, run the following command to start the server:
```bash
node index.js
```
This command launches the Node.js server using Express, which listens for API requests and interacts with the MongoDB database.

### Running the Frontend
Open another terminal window to start the frontend application. Ensure you are in the project's root directory, then run the following command:

```bash
npm start
```
