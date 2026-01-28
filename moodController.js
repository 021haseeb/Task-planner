import asyncHandler from 'express-async-handler';
import Mood from '../models/moodModel.js';

// @desc    Get all mood logs
// @route   GET /api/moods
// @access  Private
const getMoods = asyncHandler(async (req, res) => {
  const moods = await Mood.find({ user: req.user._id }).sort({ date: -1 });
  res.json(moods);
});

// @desc    Log a mood
// @route   POST /api/moods
// @access  Private
const createMood = asyncHandler(async (req, res) => {
  const { mood, stressLevel, note } = req.body;

  const moodLog = new Mood({
    user: req.user._id,
    mood,
    stressLevel,
    note,
  });

  const createdMood = await moodLog.save();
  res.status(201).json(createdMood);
});

export { getMoods, createMood };
