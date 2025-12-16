import { SetMetadata } from '@nestjs/common';

export const SKIP_ACTIVITY_LOG_KEY = 'skipActivityLog';
export const SkipActivityLog = () => SetMetadata(SKIP_ACTIVITY_LOG_KEY, true);

