const express = require('express');
const router = express.Router();

const { AuthController } = require('../controllers');

router.post('/register/', AuthController.create_user);
router.post('/login', AuthController.login_user);
router.post('/forgetPassword', forgetpassword)
router.put('/resetPassword/:token', resetPassword)



module.exports = router;