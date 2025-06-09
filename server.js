
const express = require('express');
const cors = require('cors');
const app = express();

let rooms = [
  { id: 1, name: 'Conference Room A' },
  { id: 2, name: 'Meeting Room B' },
  { id: 3, name: 'Training Room C' }
];

let bookings = [];

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Meeting Room Management Booking API');
});

app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const { name, roomId, date, time } = req.body;
  if (!name || !roomId || !date || !time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const room = rooms.find(r => r.id === parseInt(roomId));
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const newBooking = { id: Date.now(), name, roomName: room.name, date, time };
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
