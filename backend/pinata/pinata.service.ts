import { Injectable, InternalServerErrorException } from '@nestjs/common';
import 'dotenv/config';

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  view.set(buf);
  return ab;
}

@Injectable()
export class PinataService {
  private readonly endpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  private readonly jwt = process.env.PINATA_JWT!;

  private async uploadFileToPinata(
    file: Express.Multer.File,
    meta?: Record<string, string>,
  ): Promise<string> {
    const formData = new FormData();

    const ab = toArrayBuffer(file.buffer);
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/\s+/g, '_');
    const finalFileName = `${timestamp}_${sanitizedName}`;
    const webFile = new File([ab], finalFileName, { type: file.mimetype });
    formData.append('file', webFile);

    formData.append(
      'pinataMetadata',
      JSON.stringify({
        name: finalFileName,
        ...(meta && Object.keys(meta).length
          ? { keyvalues: meta }
          : { keyvalues: {} }),
      }),
    );
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.jwt}` },
      body: formData,
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new InternalServerErrorException(
        `Failed to upload document to Pinata: ${msg}`,
      );
    }

    const data = (await res.json()) as { IpfsHash: string };
    return data.IpfsHash;
  }

  async uploadProduceCertificate(
    file: Express.Multer.File,
    meta?: { produceId?: string; userId?: string; certificateType?: string },
  ): Promise<string> {
    return this.uploadFileToPinata(file, {
      ...(meta?.produceId && { produceId: meta.produceId }),
      ...(meta?.userId && { userId: meta.userId }),
      ...(meta?.certificateType && { certificateType: meta.certificateType }),
    });
  }

  async uploadFarmDocument(
    file: Express.Multer.File,
    meta?: { farmId?: string; userId?: string; documentType?: string },
  ): Promise<string> {
    return this.uploadFileToPinata(file, {
      ...(meta?.farmId && { farmId: meta.farmId }),
      ...(meta?.userId && { userId: meta.userId }),
      ...(meta?.documentType && { documentType: meta.documentType }),
    });
  }

  async uploadSubsidyEvidence(
    file: Express.Multer.File,
    meta?: { subsidyId?: string; farmerId?: string; evidenceType?: string },
  ): Promise<string> {
    return this.uploadFileToPinata(file, {
      ...(meta?.subsidyId && { subsidyId: meta.subsidyId }),
      ...(meta?.farmerId && { farmerId: meta.farmerId }),
      ...(meta?.evidenceType && { evidenceType: meta.evidenceType }),
    });
  }
}
