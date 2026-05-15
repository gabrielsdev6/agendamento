const { Router } = require('express');
const { listServices, createService, updateService, deleteService } = require('../controllers/service.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', authMiddleware, listServices);
router.post('/', authMiddleware, adminMiddleware, createService);
router.put('/:id', authMiddleware, adminMiddleware, updateService);
router.delete('/:id', authMiddleware, adminMiddleware, deleteService);

module.exports = router;
