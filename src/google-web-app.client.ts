import { BadGatewayException, Injectable } from '@nestjs/common';

const connectionError =
  'Google에 연결하지 못했습니다. 인터넷 연결과 권한 승인(npm.cmd run gas:open)을 확인하세요.';

interface GoogleWebAppSuccess<T> {
  ok: true;
  data: T;
}

interface GoogleWebAppFailure {
  ok: false;
  error: string;
}

type GoogleWebAppResponse<T> = GoogleWebAppSuccess<T> | GoogleWebAppFailure;

@Injectable()
export class GoogleWebAppClient {
  async call<T>(action: string, values: Record<string, unknown> = {}): Promise<T> {
    const url = process.env.GAS_WEBAPP_URL;
    if (!url) throw new BadGatewayException(connectionError);

    let response: Response;
    let result: GoogleWebAppResponse<T>;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, action }),
        redirect: 'follow',
      });
    } catch {
      throw new BadGatewayException(connectionError);
    }

    try {
      result = (await response.json()) as GoogleWebAppResponse<T>;
    } catch {
      throw new BadGatewayException(connectionError);
    }

    if (result && result.ok === false) {
      throw new BadGatewayException(
        typeof result.error === 'string' ? result.error : connectionError,
      );
    }
    if (!response.ok || !result || result.ok !== true || !('data' in result)) {
      throw new BadGatewayException(connectionError);
    }

    return result.data;
  }
}