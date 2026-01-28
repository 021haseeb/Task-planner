import mongoose from 'mongoose';

const habitSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly'],
    default: 'Daily',
  },
  goal: {
    type: Number,
    required: true,
    default: 1,
  },
  completedDates: [{
    type: Date,
  }],
  streak: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
