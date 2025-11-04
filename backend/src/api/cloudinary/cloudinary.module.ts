import { BadRequestException, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';

// Module wiring Cloudinary storage with Multer and environment-driven configuration.
@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Load Cloudinary credentials from the environment and configure the SDK.
        const config = {
          cloud_name: configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
          api_key: configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
          api_secret: configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
        };

        cloudinary.config(config);

        // Cloudinary-backed storage so uploads stream directly to the CDN.
        const storage = new CloudinaryStorage({
          cloudinary,
          params: () => ({
            folder: 'produce-images',
            allowed_formats: ['jpg', 'jpeg', 'png'] as const,
            use_filename: true,
            unique_filename: true,
            resource_type: 'image' as const,
          }),
        });

        return {
          storage,
          limits: { fileSize: 5 * 1024 * 1024 },
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
            return callback(null, true);
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
