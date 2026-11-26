import { BadGatewayException, Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { GoogleWebAppClient } from './google-web-app.client';

interface GooglePhoto {
  mimeType: string;
  base64: string;
}

@Controller('api/drive')
export class DrivePhotoController {
  constructor(private readonly google: GoogleWebAppClient) {}

  @Get(':fileId')
  async getPhoto(@Param('fileId') fileId: string): Promise<StreamableFile> {
    if (!/^[A-Za-z0-9_-]+$/.test(fileId)) {
      throw new BadGatewayException('등록된 사진이 없습니다.');
    }

    const photo = await this.google.call<GooglePhoto>('getPhoto', { id: fileId });
    if (
      typeof photo?.mimeType !== 'string' ||
      !/^image\/[a-zA-Z0-9.+-]+$/.test(photo.mimeType) ||
      typeof photo.base64 !== 'string' ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(photo.base64)
    ) {
      throw new BadGatewayException('등록된 사진이 없습니다.');
    }

    return new StreamableFile(Buffer.from(photo.base64, 'base64'), { type: photo.mimeType });
  }
}
