import mongoose from 'mongoose';

const moodSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  mood: {
    type: String,
    enum: ['Happy', 'Neutral', 'Sad', 'Stressed', 'Angry'],
    required: true,
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 10,
    required: true,
  },
  note: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Mood = mongoose.model('Mood', moodSchema);

export default Mood;
