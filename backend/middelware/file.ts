import dotenv from "dotenv";
dotenv.config();
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Request, Response, NextFunction } from 'express';
import { FileFilterCallback } from 'multer';

const accessKeyId = process.env.AWS_ACCESS_KEY_ID as string
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string
const region = process.env.AWS_REGION as string
const s3Client = new S3Client({
  region: region, 
  credentials: {
    accessKeyId: accessKeyId, 
    secretAccessKey: secretAccessKey, 
  },
});
console.log('AWS S3 Client created:', s3Client);

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/tiff': 'tiff',
    'image/x-icon': 'ico',
  };
console.log('MIME_TYPE_MAP:', MIME_TYPE_MAP);

const uploadToS3 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Attempting to upload file...');
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const file = req.file;
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype as keyof typeof MIME_TYPE_MAP];
    const key = `${name}-${Date.now()}.${ext}`;
    const bucketName = process.env.AWS_BUCKET_NAME; 

    console.log('File details:', { originalname: file.originalname, mimetype: file.mimetype, key, bucketName });

    const parallelUploads3 = new Upload({
      client: s3Client,
      leavePartsOnError: false,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read', 
        ContentType: file.mimetype,
      },
    });

    parallelUploads3.on('httpUploadProgress', (progress) => {
      console.log('Upload progress:', progress);
    });

    const result = await parallelUploads3.done();
    console.log('File uploaded successfully:', result);
    const region = await s3Client.config.region(); 
    res.locals.imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    next(); 
  } catch (error) {
    console.error('Error uploading to S3:', error);
    res.status(500).json({ message: 'Error uploading file to S3.', error: error });
  }
};

const multerMemoryStorage = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype as keyof typeof MIME_TYPE_MAP];
    const error: Error | null = isValid ? null : new Error('Invalid mime type!');
    if (error) {
      return cb(error);
    }
    cb(null, isValid);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, 
});
console.log('Multer memory storage configured:', multerMemoryStorage);

const uploadSingleImage = multerMemoryStorage.single('image');
console.log('Multer single image upload middleware created:', uploadSingleImage);

export default { uploadSingleImage, uploadToS3 };
