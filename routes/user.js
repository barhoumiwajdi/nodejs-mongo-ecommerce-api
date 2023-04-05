const express = require('express');
const router = express.Router();

const { accessLevelVerifier, isAdminVerifier } = require('../middlewares/verifyToken');
const { UserController } = require('../controllers');

router.get('/', UserController.get_users);
router.get('/:id', UserController.get_user);
router.get('/stats', UserController.get_stats);
router.put('/:id', UserController.update_user);
router.delete('/:id', UserController.delete_user);

module.exports = router;