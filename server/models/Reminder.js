import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    routineType: {
      type: String,
      required: true,
      enum: ['Morning Routine', 'Night Routine', 'Weekly Special'],
    },
    time: {
      type: String, // Stored in HH:MM 24-hour format (e.g., "08:30" or "21:45")
      required: true,
    },
    days: {
      type: [Number], // Array of numbers: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      default: [0, 1, 2, 3, 4, 5, 6], // Default to every day
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Reminder = mongoose.model('Reminder', reminderSchema);
export default Reminder;