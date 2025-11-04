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
  public_id: string;
  original_filename: string;
}

@Injectable()
export class CloudinaryService {
  uploadImage(file: Express.Multer.File): CloudinaryUploadPayload {
    if (!file) {
      throw new BadRequestException('No image file provided.');
    }

    const f = file as Express.Multer.File & {
      path?: string;
      secure_url?: string;
      public_id?: string;
      original_filename?: string;
    };

    const url = f.path || f.secure_url;
    const publicId = f.filename || f.public_id;
    const originalFilename = f.originalname || f.original_filename || 'unknown';

    if (!url || !publicId) {
      throw new BadRequestException('Invalid Cloudinary upload metadata.');
    }

    return {
      url,
      public_id: publicId,
      original_filename: originalFilename,
    };
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
}
