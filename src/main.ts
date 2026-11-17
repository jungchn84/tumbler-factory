import { createApp, PORT } from './app.factory';
import { getStorageInfo } from './storage-mode';

async function bootstrap(): Promise<void> {
  const app = await createApp();
  await app.listen(PORT, '127.0.0.1');
  console.log(`품질 대시보드 서버 실행 중: http://127.0.0.1:${PORT}`);
  console.log(`저장소: ${getStorageInfo().label}`);
}

void bootstrap();
