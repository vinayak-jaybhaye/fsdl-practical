const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fsdl_students';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, unique: true, trim: true },
    branch: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

app.get('/api/students', async (_req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students', error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { name, rollNo, branch } = req.body;
    const student = await Student.create({ name, rollNo, branch });
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create student', error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Student Record Management running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
