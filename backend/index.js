const express = require('express');
const cors = require('cors');
const fs = require('fs');

const bodyParser = require('body-parser');
const app = express();

app.use(cors());


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
  cookie: { secure: false } 
}));


mongoose.connect('mongodb://localhost:27017/bike-rental')
.then(() => {
    console.log('MongoDB connected'); })
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


//   const seedBikes = async () => {
//     try {
//         // Check if there are any bikes in the database
//         const count = await Bike.countDocuments();
//         if (count === 0) {
//             console.log("No bikes found in the database. Seeding bikes...");

//             // Load bike data from the JSON file
//             const bikeData = require('./data/bike-rental.bikes.json');

//             // Insert the bike data into the database
//             await Bike.insertMany(bikeData);
//             console.log('Data successfully seeded!');
//         } else {
//             console.log("Bikes are already present in the database.");
//         }
//     } catch (error) {
//         console.error('Error seeding data:', error);
//     }
// };

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

    const user = await User.findOne({ username });


    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

   
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

   
    req.session.user = user;

   
    res.json({ message: 'User authenticated successfully',username: user.username, role: user.role });
  } catch (error) {
    
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

//fetch available time slots
app.get('/availableSlots', async (req, res) => {
    const { bikeId, date } = req.query;

    try {

        const reservations = await Reservation.find({
            bike: bikeId,
            date: date
        }).select('timeSlot');

        const reservedTimeSlots = reservations.map(res => res.timeSlot);

        const bike = await Bike.findById(bikeId);
        if (!bike) {
            return res.status(404).json({ message: "Bike not found" });
        }

   
        const availableSlots = bike.timeSlots.filter(slot => !reservedTimeSlots.includes(slot));

        res.json({ slots: availableSlots });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//reserve a bike
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




//cancel reser
app.post('/cancel', async (req, res) => {
    const { reservationId, username } = req.body;

    try {

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

   
        const reservation = await Reservation.findOne({ _id: reservationId, user: user._id });
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found or does not belong to this user' });
        }

        
        await Reservation.deleteOne({ _id: reservationId });
        res.json({ message: 'Reservation cancelled successfully' });
    } catch (error) {
        console.error('Failed to cancel reservation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



//rating a bike
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
  
      
      const existingRating = bike.ratings.find(r => r.user.equals(user._id));
    
      if (existingRating) {
        return res.status(409).json({ message: 'You have already rated this bike' });
      }
  

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
      const users = await User.find({}, 'username role -_id').exec(); 
      res.json(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  // updating/editing a bike by ID
    app.put('/bikes/:id', async (req, res) => {
        try {
        const { id } = req.params; 
        const updateData = req.body; 
    
        
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
  
    //updating/editing user
    app.put('/users/:username', async (req, res) => {
        console.log("Received update request for username:", req.params.username);  
        console.log("Update data:", req.body);
        const { username } = req.params;  
        const updateData = req.body; 
    
        try {
            const updatedUser = await User.findOneAndUpdate(
                { username: username },  
                updateData,  
                { new: true , runValidators: true}  
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
    
      

    //deleting bike
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

      //deleting user
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
    
      

    //adding a new bike
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
            res.status(201).json(newBike); 
        } catch (error) {
            console.error('Failed to add new bike:', error);
            res.status(500).json({ message: 'Internal server error', error }); 
        }
    });


    //adding new users
    app.post('/users', async (req, res) => {
        const { username, password, role } = req.body;
    
        try {
           
            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Invalid user role' });
            }
    
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(409).json({ message: 'Username already exists' });
            }
    
            const newUser = new User({
                username,
                password,  
                role
            });
    
            await newUser.save();
            res.status(201).json({ message: 'User added successfully', user: newUser });
        } catch (error) {
            console.error('Failed to add new user:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    });
    



//getting user's reservations
app.get('/userReservations', async (req, res) => {
    const { username } = req.query;

    try {

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        const reservations = await Reservation.find({ user: user._id })
            .populate('bike', 'model imageUrl') 
            .exec();
        console.log("reservations: ", reservations)

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

//getting all user's reservations
app.get('/allUserReservations', async (req, res) => {
    try {
        const reservations = await Reservation.find({})
            .populate('bike', 'model imageUrl')  
            .populate('user', 'username')  
            .exec();


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



const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
