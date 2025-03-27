import express, { Request, Response, NextFunction } from 'express';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Document, Types } from 'mongoose';
const router = express.Router();

router.post('/signup', (req: any, res: any, next: any) => {
  bcrypt.hash(req.body.password, 10).then((hash: any) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: 'User Created!',
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  });
});

router.post('/login', (req: any, res: any, next: any) => {
    let fetchedUser: Document<unknown, {}, { password: string; email: string; }> & { password: string; email: string; } & { _id: Types.ObjectId; } & { __v: number; };
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: 'Auth failed',
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: 'Auth Failed',
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id},
        'secret_this_should_be_longer',
        { expiresIn: '1h' }
      );
      res.status(200).json({
        token : token
      })
    })
    .catch((err) => {
      return res.status(401).json({
        message: 'Auth failed',
      });
    });
});

export default router;
