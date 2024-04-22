const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');


mongoose.connect('mongodb://localhost:27017/bike-rental', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
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
  
const Bike = model('Bike', bikeSchema);
// const Bike = require('./models/Bike'); // Update the path as necessary

const seedBikes = async () => {
    try {
        const count = await Bike.countDocuments();
        if (count === 0) {
            console.log("No bikes found in the database. Seeding bikes...");

            // Load bike data from the JSON file
            const bikeData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'bike-rental.bikes.json'), 'utf8'));

            // Insert the bike data into the database
            await Bike.insertMany(bikeData);
            console.log('Data successfully seeded!');
        } else {
            console.log("Bikes are already present in the database.");
        }
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.disconnect();
    }
};

seedBikes();
