const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fsdl_events';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    eventName: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const Registration = mongoose.model('Registration', eventSchema);

app.get('/api/registrations', async (_req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 }).lean();
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch registrations', error: err.message });
  }
});

app.post('/api/registrations', async (req, res) => {
  try {
    const { name, email, eventName } = req.body;
    const registration = await Registration.create({ name, email, eventName });
    res.status(201).json(registration);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create registration', error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Event Registration System running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
