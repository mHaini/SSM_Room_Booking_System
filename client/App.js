
import React, { useEffect, useState } from 'react';

function App() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ name: '', roomId: '', date: '', time: '' });

  useEffect(() => {
    fetch('http://localhost:5000/api/rooms')
      .then(res => res.json())
      .then(setRooms);

    fetch('http://localhost:5000/api/bookings')
      .then(res => res.json())
      .then(setBookings);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(newBooking => {
        setBookings([...bookings, newBooking]);
        setForm({ name: '', roomId: '', date: '', time: '' });
      });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meeting Room Management</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name" className="w-full p-2 border" required />
        <select name="roomId" value={form.roomId} onChange={handleChange} className="w-full p-2 border" required>
          <option value="">Select a Room</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>{room.name}</option>
          ))}
        </select>
        <input name="date" value={form.date} onChange={handleChange} type="date" className="w-full p-2 border" required />
        <input name="time" value={form.time} onChange={handleChange} type="time" className="w-full p-2 border" required />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white">Book Room</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Bookings</h2>
      <ul className="space-y-2">
        {bookings.map(b => (
          <li key={b.id} className="p-2 border rounded">
            {b.name} booked {b.roomName} on {b.date} at {b.time}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
