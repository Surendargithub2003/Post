import dotenv from "dotenv";
dotenv.config();
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      password: hashedPassword,
    });

    const result = await user.save();

    res.status(201).json({
      message: 'User Created!',
      result,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ // Add the return statement here
        error: {
          message: 'User with this email already exists!',
        },
      });
    }

    res.status(500).json({
      error: {
        message: 'An unknown error occurred!',
        details: err.message,
      },
    });
  }
};
const userLogin = (req: Request, res: Response, next: NextFunction) => {
  let fetchedUser: any;

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        res.status(401).json({
          message: 'Authentication failed: Email not found',
        });
        throw new Error('StopExecution'); 
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((isMatch) => {
      if (!isMatch) {
        res.status(401).json({
          message: 'Authentication failed: Incorrect password',
        });
        throw new Error('StopExecution'); 
      }

      const secretKey = process.env.JWT_KEY;
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        secretKey as string,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        token: token,
        expiresIn: "3600",
        userId: fetchedUser._id,
      });
    })
    .catch((err) => {
      if (err.message === 'StopExecution') return; 
      console.error("Login Error:", err);
      res.status(500).json({
        message: 'Login failed due to server error.',
      });
    });
};

export default { createUser, userLogin };
