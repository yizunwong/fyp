import { BadRequestException, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// NestJS module wiring Cloudinary uploads via Multer with TypeScript support
@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Configure Cloudinary
        cloudinary.config({
          cloud_name: configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
          api_key: configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
          api_secret: configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
        });

        // Multer storage: memory storage (buffer) for processing before upload
        const storage = multer.memoryStorage();

        return {
          storage,
          limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
          fileFilter: (
            req: Express.Request,
            file: Express.Multer.File,
            callback: (error: Error | null, acceptFile: boolean) => void,
          ) => {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
              return callback(
                new BadRequestException(
                  'Only jpg, jpeg, and png image uploads are allowed.',
                ),
                false,
              );
            }
            callback(null, true);
          },
        };
      },
    }),
  ],
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
