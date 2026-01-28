import express from 'express';
const router = express.Router();
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
} from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getHabits).post(protect, createHabit);
router
  .route('/:id')
  .put(protect, updateHabit)
  .delete(protect, deleteHabit);

export default router;
