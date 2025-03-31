import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Document, Types } from 'mongoose';

const createUser = (req: any, res: any, next: any) => {
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
          error: {
            message : "Invalid authentication creadentials!"
          },
        });
      });
  });
}

const userLogin = (req: any, res: any, next: any) => {
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
      const secretKey = process.env['JWT_KEY'];
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id},
         secretKey as string,
        { expiresIn: '1h' }
      );
      res.status(200).json({
        token : token,
        expiresIn : "3600",
        userId : fetchedUser._id
      })
    })
    .catch((err) => {
      return res.status(401).json({
        message: 'Invalid authentication creadentials!',
      });
    });
}


export default {createUser,userLogin};