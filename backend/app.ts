import path from 'path';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import Post from './models/post.js';
import postsRoutes from './routes/posts.js';
import userRoutes from './routes/user.js';
const app = express();

const secretKey = process.env['MONGO_ATLAS_PW'];

mongoose
  .connect(
    'mongodb+srv://admin:' +
      secretKey +
      '@cluster0.wdvb3.mongodb.net/node-angular?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection failed');
  });

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join('backend/images')));

app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type , Accept , Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET , POST , PATCH ,PUT, DELETE, OPTIONS'
  );
  next();
});

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

export default app;
