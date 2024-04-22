const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');
app.use(bodyParser.json());
const session = require('express-session');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(16).toString('hex'); 
console.log(secretKey);


app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to false if you are not using HTTPS
}));

mongoose.connect('mongodb://localhost:27017/bike-rental')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('Failed to connect to MongoDB', err));

  const { Schema, model } = mongoose;

  const bikeSchema = new Schema({
    model: String,
    color: String,
    location: String,
    ratings: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, rating: Number }],
    averageRating: { type: Number, default: 0 },
    available: Boolean,
    imageUrl: String,
    availability: [String],
    timeSlots: [String]
  });
  
  const reservationSchema = new Schema({
    bike: { type: Schema.Types.ObjectId, ref: 'Bike' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    date: String,
    timeSlot: String
  });
  
  const userSchema = new Schema({
    username: String,
    password: String,
    role: { type: String, default: 'user' }
  });
  
  const Bike = model('Bike', bikeSchema);
  const Reservation = model('Reservation', reservationSchema);
  const User = model('User', userSchema);

  //////////////////////////////////////////////////////////////////////////////

// Signup Endpoint
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find the user by username
    const user = await User.findOne({ username });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords (assuming passwords are stored securely, such as hashed)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Store user information in session
    req.session.user = user;

    // Respond with user role
    res.json({ message: 'User authenticated successfully',username: user.username, role: user.role });
  } catch (error) {
    // Handle any errors
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Logout Endpoint
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out.' });
    }
    res.clearCookie('connect.sid'); 
    return res.status(200).json({ message: 'Logged out successfully.' });
  });
});

// Bike endpoint
app.get('/bikes', async (req, res) => {
    try {
        const bikes = await Bike.find({});
        res.json(bikes);
    } catch (error) {
        console.error('Failed to fetch bikes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/availableSlots', async (req, res) => {
    const { bikeId, date } = req.query;

    try {
        // Fetch all reservations for the specific bike and date
        const reservations = await Reservation.find({
            bike: bikeId,
            date: date
        }).select('timeSlot');

        // Get all reserved time slots as an array
        const reservedTimeSlots = reservations.map(res => res.timeSlot);

        // Fetch the bike to get its available time slots
        const bike = await Bike.findById(bikeId);
        if (!bike) {
            return res.status(404).json({ message: "Bike not found" });
        }

        // Filter out the time slots that are not reserved
        const availableSlots = bike.timeSlots.filter(slot => !reservedTimeSlots.includes(slot));

        res.json({ slots: availableSlots });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.post('/reserve', async (req, res) => {
    const { bikeId, date, timeSlot, username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const existingReservation = await Reservation.findOne({
            bike: bikeId,
            date: date,
            timeSlot: timeSlot
        });

        if (existingReservation) {
            return res.status(409).json({ message: 'This time slot is already booked.' });
        }

        const reservation = new Reservation({
            bike: bikeId,
            user: user._id,
            date: date,
            timeSlot: timeSlot
        });

        await reservation.save();
        res.json({ message: 'Bike reserved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});





app.post('/cancel', async (req, res) => {
    const { reservationId, username } = req.body;

    try {
        // First, find the user by username to get the user's ID
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure the reservation belongs to the user attempting to cancel it
        const reservation = await Reservation.findOne({ _id: reservationId, user: user._id });
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found or does not belong to this user' });
        }

        // If the reservation is found and belongs to the user, delete it
        await Reservation.deleteOne({ _id: reservationId });
        res.json({ message: 'Reservation cancelled successfully' });
    } catch (error) {
        console.error('Failed to cancel reservation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.post('/rate', async (req, res) => {
 
    const { bikeId, rating, username } = req.body;

  
    try {
      const user = await User.findOne({ username });
   
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const bike = await Bike.findById(bikeId);
  
      if (!bike) {
        return res.status(404).json({ message: 'Bike not found' });
      }
  
      // Check if the user has already rated the bike
      const existingRating = bike.ratings.find(r => r.user.equals(user._id));
    
      if (existingRating) {
        return res.status(409).json({ message: 'You have already rated this bike' });
      }
  
   
      // Add new rating
      bike.ratings.push({ user: user._id, rating });
      bike.averageRating = bike.ratings.reduce((acc, curr) => acc + curr.rating, 0) / bike.ratings.length;
      await bike.save();
  
      res.json({ message: 'Rating added successfully', averageRating: bike.averageRating });
    } catch (error) {
      console.error('Failed to rate bike:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/users', async (req, res) => {
    try {
      const users = await User.find({}, 'username role -_id').exec(); // Excluding password and __v from the result
      res.json(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  // PUT endpoint for updating a bike by ID
    app.put('/bikes/:id', async (req, res) => {
        try {
        const { id } = req.params; // Get the bike ID from the URL
        const updateData = req.body; // Get the updated bike data from the request body
    
        // Update the bike by ID with the new data
        const updatedBike = await Bike.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedBike) {
            return res.status(404).json({ message: 'Bike not found' });
        }
    
        res.json(updatedBike);
        } catch (error) {
        console.error('Failed to update bike:', error);
        res.status(500).json({ message: 'Internal server error' });
        }
    });
  
    app.put('/users/:username', async (req, res) => {
        console.log("Received update request for username:", req.params.username);  // Log the username received in the request
        console.log("Update data:", req.body);
        const { username } = req.params;  // Extract username from URL
        const updateData = req.body;  // Data sent in request to update the user
    
        try {
            const updatedUser = await User.findOneAndUpdate(
                { username: username },  // Find user by username
                updateData,  // Update fields sent in request
                { new: true , runValidators: true}  // Return new document and run schema validators
            );
    
            if (!updatedUser) {
                console.log("No user found with username:", username);
                return res.status(404).json({ message: 'User not found' });
            }
            console.log("Updated user:", updatedUser); 
            res.json({ message: 'User updated successfully', user: updatedUser });
        } catch (error) {
            console.error('Failed to update user:', error);
            res.status(500).json({ message: 'Internal server error', error: error });
        }
    });
    
      

    app.delete('/bikes/:id', async (req, res) => {
        try {
            const { id } = req.params;
            console.log("id", id)
          const bike = await Bike.findByIdAndDelete(id);
          if (!bike) {
            console.log("No bike found with ID:", id);
            return res.status(404).json({ message: 'Bike not found' });
          }
          console.log("Deleted bike:", bike);
          res.json({ message: 'Bike deleted successfully', bikeId: id});
        } catch (error) {
          console.error('Failed to delete bike:', error);
          res.status(500).json({ message: 'Internal server error' ,error: error  });
        }
      });

      app.delete('/users/:username', async (req, res) => {
        const { username } = req.params;
    
        try {
            const deletedUser = await User.findOneAndDelete({ username: username });
            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Failed to delete user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
      

      app.post('/bikes', async (req, res) => {
        const { model, color, location, available, imageUrl, availability, timeSlots } = req.body;
        try {
            const newBike = new Bike({
                model,
                color,
                location,
                available,
                imageUrl,
                availability,
                timeSlots
            });
    
            await newBike.save();
            res.status(201).json(newBike); // Send back the newly created bike with 201 Created status
        } catch (error) {
            console.error('Failed to add new bike:', error);
            res.status(500).json({ message: 'Internal server error', error }); // Provide error message and details
        }
    });


    app.post('/users', async (req, res) => {
        const { username, password, role } = req.body;
    
        try {
            // Ensure the role is correctly set to 'user' or 'admin'
            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Invalid user role' });
            }
    
            // Check if username already exists to avoid duplicates
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(409).json({ message: 'Username already exists' });
            }
    
            const newUser = new User({
                username,
                password,  // Storing the password directly, not recommended for production
                role
            });
    
            await newUser.save();
            res.status(201).json({ message: 'User added successfully', user: newUser });
        } catch (error) {
            console.error('Failed to add new user:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
    










app.get('/userReservations', async (req, res) => {
    const { username } = req.query;

    try {
        // First, find the user by username to get the user's ID
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Use the user's ID to find all reservations associated with the user
        const reservations = await Reservation.find({ user: user._id })
            .populate('bike', 'model imageUrl') // Only populate 'model' and 'imageUrl' from the 'Bike' collection
            .exec();
        console.log("reservations: ", reservations)
        // Format the reservations data for the response
        const formattedReservations = reservations.map(res => ({
            _id: res._id,
            bike: {
                _id: res.bike._id,
                model: res.bike.model,
                imageUrl: res.bike.imageUrl
            },
            date: res.date,
            timeSlot: res.timeSlot
        }));

        res.json(formattedReservations);
    } catch (error) {
        console.error('Failed to fetch reservations for user:', username, error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/allUserReservations', async (req, res) => {
    try {
        const reservations = await Reservation.find({})
            .populate('bike', 'model imageUrl')  // Populate bike details
            .populate('user', 'username')  // Populate user details
            .exec();

        // Group reservations by user
        const userReservations = reservations.reduce((acc, res) => {
            acc[res.user.username] = acc[res.user.username] || [];
            acc[res.user.username].push({
                bike: {
                    _id: res.bike._id,
                    model: res.bike.model,
                    imageUrl: res.bike.imageUrl
                },
                date: res.date,
                timeSlot: res.timeSlot
            });
            return acc;
        }, {});

        res.json(userReservations);
    } catch (error) {
        console.error('Failed to fetch reservations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/bikesWithReservations', async (req, res) => {
    try {
        const reservations = await Reservation.find({})
            .populate('bike', 'model imageUrl')
            .populate('user', 'username')
            .exec();

        // Transform the data to be grouped by bike
        const reservationsByBike = reservations.reduce((acc, reservation) => {
            const bikeId = reservation.bike._id.toString();
            if (!acc[bikeId]) {
                acc[bikeId] = {
                  ...reservation.bike.toObject(),
                  reservations: [],
                };
            }
            acc[bikeId].reservations.push({
                user: reservation.user.username,
                date: reservation.date,
                timeSlot: reservation.timeSlot,
            });
            return acc;
        }, {});

        res.json(Object.values(reservationsByBike));
    } catch (error) {
        console.error('Failed to fetch bikes with reservations:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// app.get('/userReservations', async (req, res) => {
//     const { username } = req.query;

//     try {
//         const reservations = await Reservation.find({ username }).populate('bike');
//         res.json(reservations.map(res => ({
//             _id: res._id,
//             bike: {
//                 _id: res.bike._id,
//                 model: res.bike.model,
//                 imageUrl: res.bike.imageUrl
//             },
//             date: res.date,
//             timeSlot: res.timeSlot
//         })));
//     } catch (error) {
//         console.error('Failed to fetch reservations for user:', username, error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });


// app.post('/reserve', async (req, res) => {
//     const { bikeId, date, timeSlot, username } = req.body;

//     try {
//         // Ensure the user exists
//         const user = await User.findOne({ username });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         // Check if the reservation already exists for the given slot
//         const existingReservation = await Reservation.findOne({
//             bike: bikeId,
//             date: date,
//             timeSlot: timeSlot
//         });

//         if (existingReservation) {
//             return res.status(409).json({ message: 'This time slot is already booked.' });
//         }

//         // Create a new reservation using username directly
//         const reservation = new Reservation({
//             bike: bikeId,
//             user: user._id,  // Linking the reservation to the user's ObjectId for reference integrity
//             date: date,
//             timeSlot: timeSlot
//         });

//         await reservation.save();
//         res.status(201).json({
//             message: 'Bike reserved successfully',
//             reservation: {
//                 _id: reservation._id,
//                 bikeId: reservation.bike,
//                 username: user.username,  // Including username in the response for clarity
//                 date: reservation.date,
//                 timeSlot: reservation.timeSlot
//             }
//         });
//     } catch (error) {
//         console.error('Error reserving the bike:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
