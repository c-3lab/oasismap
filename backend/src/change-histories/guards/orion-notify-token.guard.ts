import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import type { Request } from 'express';
import { ORION_NOTIFY_TOKEN_HEADER } from '../change-histories.constants';
import { ORION_NOTIFY_SECRET } from './orion-notify-secret';

const digest = (value: string): Buffer =>
  createHash('sha256').update(value, 'utf8').digest();

// Orion からの通知に付与された共有シークレットを検証する。
// 値は比較前に SHA-256 で固定長にし、長さの違いや比較時間からシークレットが推測されないようにする。
@Injectable()
export class OrionNotifyTokenGuard implements CanActivate {
  private readonly logger = new Logger(OrionNotifyTokenGuard.name);
  private readonly expectedDigest: Buffer;

  constructor(@Inject(ORION_NOTIFY_SECRET) secret: string) {
    this.expectedDigest = digest(secret);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers[ORION_NOTIFY_TOKEN_HEADER];

    if (typeof token !== 'string' || token === '') {
      this.logger.warn(
        `Notification rejected: ${ORION_NOTIFY_TOKEN_HEADER} header is missing. ip=${request.ip}`,
      );
      throw new UnauthorizedException('Notify token is required');
    }

    if (!timingSafeEqual(digest(token), this.expectedDigest)) {
      this.logger.warn(
        `Notification rejected: invalid ${ORION_NOTIFY_TOKEN_HEADER}. ip=${request.ip}`,
      );
      throw new UnauthorizedException('Invalid notify token');
    }

    return true;
  }
}
