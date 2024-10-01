const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()

app.use(cors())
app.use(bodyParser.json()); // To handle JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // To handle URL-encoded bodies
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Store users and IDs
const users = [];
let id = 0;

// Get all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// Create a new user
app.post("/api/users", (req, res) => {
  const username = req.body.username;
  id++;
  let newUser = {
    username: username,
    _id: id.toString(),  // Keep ID as string for consistency
    log: []  // Initialize empty log for exercises
  };
  users.push(newUser);
  res.json({ username: username, _id: newUser._id });
});

// Add an exercise to a user
app.post("/api/users/:_id/exercises", (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  // Find the user by ID
  const user = users.find(user => user._id === userId);
  if (!user) {
    return res.json({ error: "User not found" });
  }

  // Parse the date or use current date if not provided
  const exerciseDate = date ? new Date(date) : new Date();
  if (isNaN(exerciseDate)) {
    return res.json({ error: "Invalid date" });
  }

  // Create a new exercise object
  const newExercise = {
    description: description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString()
  };

  // Add the exercise to the user's log
  user.log.push(newExercise);

  // Return the user object with the added exercise
  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id
  });
});

// Get user logs
app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  // Find the user by ID
  const user = users.find(user => user._id === userId);
  if (!user) {
    return res.json({ error: "User not found" });
  }

  let logs = user.log;

  // Filter logs by 'from' and 'to' dates if provided
  if (from) {
    const fromDate = new Date(from);
    logs = logs.filter(exercise => new Date(exercise.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    logs = logs.filter(exercise => new Date(exercise.date) <= toDate);
  }

  // Limit the number of logs if 'limit' is provided
  if (limit) {
    logs = logs.slice(0, parseInt(limit));
  }

  // Return the user's logs with a count
  res.json({
    _id: user._id,
    username: user.username,
    count: logs.length,
    log: logs
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
