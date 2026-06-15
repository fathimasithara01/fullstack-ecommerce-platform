import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';
import streamifier from 'streamifier';

// Configure Cloudinary SDK Context
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer in-memory storage buffer strategy
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file constraints: 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid runtime asset format. Images only.'));
    }
  },
});

export const uploadToCloudinary = (fileBuffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cldStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ width: 800, height: 800, crop: 'fill', quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary output frame is void'));
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(cldStream);
  });
};

export const handleMultipleUploads = (fieldName: string) => {
  return [
    upload.array(fieldName, 5),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
          next();
          return;
        }
        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer, 'products'));
        req.body.images = await Promise.all(uploadPromises);
        next();
      } catch (error) {
        next(error);
      }
    },
  ];
};