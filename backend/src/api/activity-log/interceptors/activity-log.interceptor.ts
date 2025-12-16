import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ActivityLogService } from '../activity-log.service';
import { RequestWithUser } from '../../auth/types/request-with-user';
import { SKIP_ACTIVITY_LOG_KEY } from '../decorators/skip-activity-log.decorator';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ActivityLogInterceptor.name);

  constructor(
    private readonly activityLogService: ActivityLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { method, url, params, body, query } = request;
    const user = request.user;
    const handler = context.getHandler();
    const controller = context.getClass();

    // Check if logging is skipped via decorator
    const skipLogging = this.reflector.getAllAndOverride<boolean>(
      SKIP_ACTIVITY_LOG_KEY,
      [handler, controller],
    );

    if (skipLogging) {
      return next.handle();
    }

    // Skip logging for activity log endpoints to avoid infinite loops
    if (
      controller.name === 'ActivityLogController' ||
      url?.includes('/activity-logs')
    ) {
      return next.handle();
    }

    // Skip if user is not authenticated (optional - you can remove this if you want to log all requests)
    if (!user) {
      return next.handle();
    }

    // Extract IP address
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.ip ||
      request.socket.remoteAddress ||
      'unknown';

    // Extract user agent
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Build action name from method and route
    const action = this.buildActionName(method, url, handler.name);

    // Extract entity type and ID from route parameters
    const { entityType, entityId } = this.extractEntityInfo(url, params, body);

    // Build details object
    const details: Record<string, any> = {
      method,
      url,
      controller: controller.name,
      handler: handler.name,
    };

    // Add query params if present (limit sensitive data)
    if (query && Object.keys(query).length > 0) {
      details.query = query;
    }

    // Add relevant body data (limit sensitive data like passwords)
    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = { ...body };
      // Remove sensitive fields
      delete sanitizedBody.password;
      delete sanitizedBody.token;
      delete sanitizedBody.refreshToken;
      if (Object.keys(sanitizedBody).length > 0) {
        details.body = sanitizedBody;
      }
    }

    // Log activity asynchronously (non-blocking)
    this.logActivity(user.id, action, entityType, entityId, details, ipAddress, userAgent)
      .catch((error) => {
        // Log error but don't fail the request
        this.logger.error(`Failed to log activity: ${error.message}`);
      });

    return next.handle();
  }

  private buildActionName(
    method: string,
    url: string,
    handlerName: string,
  ): string {
    // Convert method to uppercase
    const methodUpper = method.toUpperCase();

    // Try to extract meaningful action from handler name or URL
    // e.g., "createFarm" -> "CREATE_FARM", "updateFarm" -> "UPDATE_FARM"
    if (handlerName) {
      const action = handlerName
        .replace(/([A-Z])/g, '_$1')
        .toUpperCase()
        .replace(/^_/, '');
      return `${methodUpper}_${action}`;
    }

    // Fallback to method and URL path
    const pathParts = url.split('?')[0].split('/').filter(Boolean);
    const resource = pathParts[pathParts.length - 1] || 'unknown';
    return `${methodUpper}_${resource.toUpperCase()}`;
  }

  private extractEntityInfo(
    url: string,
    params: any,
    body: any,
  ): { entityType: string | undefined; entityId: string | undefined } {
    // Extract entity ID from URL params (common patterns: /:id, /:farmId, /:produceId, etc.)
    let entityId: string | undefined;
    let entityType: string | undefined;

    // Check URL parameters
    if (params) {
      // Look for common ID patterns
      const idKeys = ['id', 'farmId', 'produceId', 'subsidyId', 'programId', 'userId', 'documentId'];
      for (const key of idKeys) {
        if (params[key]) {
          entityId = params[key];
          // Infer entity type from the key
          entityType = key.replace('Id', '').replace(/^\w/, (c) => c.toUpperCase());
          break;
        }
      }
    }

    // Also check body for entity references
    if (!entityId && body) {
      const idKeys = ['id', 'farmId', 'produceId', 'subsidyId', 'programId', 'userId', 'documentId'];
      for (const key of idKeys) {
        if (body[key]) {
          entityId = body[key];
          entityType = key.replace('Id', '').replace(/^\w/, (c) => c.toUpperCase());
          break;
        }
      }
    }

    // Infer entity type from URL path if not found
    if (!entityType && url) {
      const pathParts = url.split('?')[0].split('/').filter(Boolean);
      // Look for common entity names in the path
      const entityNames = ['farm', 'produce', 'subsidy', 'program', 'user', 'notification', 'report'];
      for (const entityName of entityNames) {
        if (pathParts.includes(entityName)) {
          entityType = entityName.charAt(0).toUpperCase() + entityName.slice(1);
          break;
        }
      }
    }

    return { entityType, entityId };
  }

  private async logActivity(
    userId: string,
    action: string,
    entityType: string | undefined,
    entityId: string | undefined,
    details: Record<string, any>,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    try {
      await this.activityLogService.createActivityLog(userId, {
        action,
        entityType,
        entityId,
        details,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      // Log error but don't throw - we don't want to break the request
      this.logger.error(`Error creating activity log: ${error}`);
    }
  }
}

