const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const methodOverride = require('method-override'); // To handle PUT and DELETE requests in forms
const app = express();

// MongoDB connection 
mongoose.connect(process.env.MONGO_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log("MongoDB connection error:", err));

// Middleware
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data (form data)
app.use(express.json()); // To parse JSON data
app.use(methodOverride('_method')); // Allows use of _method for PUT/DELETE methods in forms

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', './views');

// Define the User model
const User = mongoose.model('User', new mongoose.Schema({
  firstName: String,
  lastName: String,
  dateOfBirth: Date,  
  address1: String,
  address2: String,
  city: String,
  postalCode: String,
  country: String,
  phoneNumber: String,
  email: String,
  notes: String
}));

// Routes
// Show the form to add a new user
app.get('/users/new', (req, res) => {
  res.render('new'); // renders 'views/new.pug'
});

// Handle POST request to create a new user
app.post('/users', (req, res) => {
  const { firstName, lastName, email, address1, address2, city, postalCode, country, phoneNumber, notes } = req.body;
  const newUser = new User({ firstName, lastName, email, address1, address2, city, postalCode, country, phoneNumber, notes });
  
  newUser.save()
    .then(() => res.redirect('/users'))
    .catch((err) => res.status(500).send("Error saving user: " + err));
});

// Show a list of all users
app.get('/users', (req, res) => {
  User.find()
    .then(users => res.render('index', { users })) // renders 'views/index.pug' with users data
    .catch(err => res.status(500).send("Error retrieving users: " + err));
});

// Show the form to edit a user
app.get('/users/:id/edit', (req, res) => {
  User.findById(req.params.id)
    .then(user => res.render('edit', { user })) // renders 'views/edit.pug' with user data
    .catch(err => res.status(500).send("Error retrieving user: " + err));
});

// Handle PUT request to update a user
app.put('/users/:id', (req, res) => {
  User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(() => res.redirect('/users'))
    .catch((err) => res.status(500).send("Error updating user: " + err));
});

// Handle DELETE request to delete a user
/*app.delete('/users/:id', (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.redirect('/users'))
    .catch((err) => res.status(500).send("Error deleting user: " + err));
});*/



// Handle DELETE request to delete a user
app.delete('/users/:id', async (req, res) => {
    console.log("DELETE request received for ID:", req.params.id);
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/users'); // Redirect after successful deletion
    } catch (err) {
        res.status(500).send("Error deleting user: " + err);
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
