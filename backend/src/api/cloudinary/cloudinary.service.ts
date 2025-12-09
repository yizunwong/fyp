import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';

export interface CloudinaryUploadPayload {
  url: string;
  publicId: string;
  originalFilename: string;
}

@Injectable()
export class CloudinaryService {
  async uploadImage(
    buffer: Buffer,
    folderName?: string,
  ): Promise<CloudinaryUploadPayload> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(new Error(error.message));
          }

          if (!result) {
            return reject(new Error('Upload result is undefined.'));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            originalFilename: result.original_filename,
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  async deleteImage(publicId: string): Promise<{ deleted: boolean }> {
    if (!publicId) {
      throw new BadRequestException('A valid public_id is required.');
    }

    const result = (await cloudinary.uploader.destroy(publicId)) as
      | UploadApiResponse
      | UploadApiErrorResponse
      | { result?: string };

    if (result.result !== 'ok') {
      throw new NotFoundException(`Image not found: ${publicId}`);
    }

    return { deleted: true };
  }

  async uploadFile(
    buffer: Buffer,
    folderName?: string,
  ): Promise<CloudinaryUploadPayload> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName, resource_type: 'auto' },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(new Error(error.message));
          }

          if (!result) {
            return reject(new Error('Upload result is undefined.'));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            originalFilename: result.original_filename,
          });
        },
      );

      uploadStream.end(buffer);
    });
  }
}
