const { Router } = require('express');
const {
  createAppointment,
  listMyAppointments,
  cancelAppointment,
  listAllAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointment.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/', authMiddleware, createAppointment);
router.get('/my', authMiddleware, listMyAppointments);
router.patch('/:id/cancel', authMiddleware, cancelAppointment);

router.get('/all', authMiddleware, adminMiddleware, listAllAppointments);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateAppointmentStatus);

module.exports = router;
