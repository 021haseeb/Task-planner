import asyncHandler from 'express-async-handler';
import Habit from '../models/habitModel.js';

// @desc    Get all habits
// @route   GET /api/habits
// @access  Private
const getHabits = asyncHandler(async (req, res) => {
  const habits = await Habit.find({ user: req.user._id });
  res.json(habits);
});

// @desc    Create a habit
// @route   POST /api/habits
// @access  Private
const createHabit = asyncHandler(async (req, res) => {
  const { name, frequency, goal } = req.body;

  const habit = new Habit({
    user: req.user._id,
    name,
    frequency,
    goal,
  });

  const createdHabit = await habit.save();
  res.status(201).json(createdHabit);
});

// @desc    Update a habit (e.g., mark as completed for today)
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (habit) {
    if (habit.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    habit.name = req.body.name || habit.name;
    habit.frequency = req.body.frequency || habit.frequency;
    habit.goal = req.body.goal || habit.goal;
    
    if (req.body.completedDate) {
        // Check if date already exists to avoid duplicates
        const dateExists = habit.completedDates.some(
            (date) => new Date(date).toDateString() === new Date(req.body.completedDate).toDateString()
        );
        
        if (!dateExists) {
            habit.completedDates.push(req.body.completedDate);
            // Simple streak logic: increment if last completion was yesterday (simplified)
            habit.streak += 1; 
        }
    }

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } else {
    res.status(404);
    throw new Error('Habit not found');
  }
});

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (habit) {
    if (habit.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await habit.deleteOne();
    res.json({ message: 'Habit removed' });
  } else {
    res.status(404);
    throw new Error('Habit not found');
  }
});

export { getHabits, createHabit, updateHabit, deleteHabit };
