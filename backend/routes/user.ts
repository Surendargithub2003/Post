import express, { Request, Response, NextFunction } from 'express';
import users from '../controllers/user.js';



const router = express.Router();

router.post('/signup',users.createUser);
router.post('/login', users.userLogin);

export default router;
