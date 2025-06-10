const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = 'your_secret_key';

let users = [];
let rooms = [
  { id: 1, name: 'Conference Room A' },
  { id: 2, name: 'Meeting Room B' },
  { id: 3, name: 'Training Room C' }
];
let bookings = [];

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Meeting Room Booking API is running');
});

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const existing = users.find(u => u.username === username);
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ id: Date.now(), username, password: hashedPassword });
  res.status(201).json({ message: 'User registered' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ username: user.username }, SECRET_KEY);
  res.json({ token });
});

// Get all rooms
app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

// Room availability
app.get('/api/rooms/:id/availability', (req, res) => {
  const { id } = req.params;
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Date required' });

  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  const booked = bookings.filter(b => b.roomId === parseInt(id) && b.date === date).map(b => b.time);
  const available = times.filter(t => !booked.includes(t));
  res.json({ available });
});

// Get all bookings (auth)
app.get('/api/bookings', authenticateToken, (req, res) => {
  res.json(bookings);
});

// Create booking (auth)
app.post('/api/bookings', authenticateToken, (req, res) => {
  const { name, roomId, date, time } = req.body;
  if (!name || !roomId || !date || !time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const room = rooms.find(r => r.id === parseInt(roomId));
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const alreadyBooked = bookings.find(b => b.roomId === parseInt(roomId) && b.date === date && b.time === time);
  if (alreadyBooked) {
    return res.status(409).json({ message: 'Time slot already booked' });
  }

  const newBooking = { id: Date.now(), name, roomId: parseInt(roomId), roomName: room.name, date, time };
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// Update booking (auth)
app.put('/api/bookings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, roomId, date, time } = req.body;

  const booking = bookings.find(b => b.id === parseInt(id));
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  const room = rooms.find(r => r.id === parseInt(roomId));
  if (!room) return res.status(404).json({ message: 'Room not found' });

  booking.name = name || booking.name;
  booking.roomId = parseInt(roomId) || booking.roomId;
  booking.roomName = room.name;
  booking.date = date || booking.date;
  booking.time = time || booking.time;

  res.json(booking);
});

// Delete booking (auth)
app.delete('/api/bookings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const index = bookings.findIndex(b => b.id === parseInt(id));
  if (index === -1) return res.status(404).json({ message: 'Booking not found' });

  bookings.splice(index, 1);
  res.json({ message: 'Booking deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
