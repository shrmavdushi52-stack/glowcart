import Reminder from '../models/Reminder.js';

// @desc    Create a new routine reminder
// @route   POST /api/reminders
export const createReminder = async (req, res) => {
  try {
    const { routineType, time, days } = req.body;

    if (!routineType || !time) {
      return res.status(400).json({ message: 'Routine type and time are required.' });
    }

    const reminder = await Reminder.create({
      userId: req.user.id, // Comes from our auth middleware
      routineType,
      time,
      days,
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all reminders for logged-in user
// @route   GET /api/reminders
export const getUserReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ time: 1 });
    res.status(200).json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found.' });
    }

    // Make sure user owns this reminder
    if (reminder.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this reminder.' });
    }

    await reminder.deleteOne();
    res.status(200).json({ success: true, message: 'Reminder removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};