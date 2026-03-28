import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('SecurityAudit');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip, headers } = request;
        const userAgent = headers['user-agent'] || 'unknown';
        const user = request.user;

        const now = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const responseTime = Date.now() - now;

                    // Log sensitive operations
                    if (this.isSensitiveOperation(method, url)) {
                        this.logger.log({
                            message: 'Security Event',
                            method,
                            url,
                            ip,
                            userAgent,
                            userId: user?.userId || 'anonymous',
                            userEmail: user?.email || 'anonymous',
                            responseTime: `${responseTime}ms`,
                            timestamp: new Date().toISOString(),
                        });
                    }
                },
                error: (error) => {
                    const responseTime = Date.now() - now;

                    // Log all errors for security monitoring
                    this.logger.error({
                        message: 'Security Event - Error',
                        method,
                        url,
                        ip,
                        userAgent,
                        userId: user?.userId || 'anonymous',
                        userEmail: user?.email || 'anonymous',
                        error: error.message,
                        statusCode: error.status,
                        responseTime: `${responseTime}ms`,
                        timestamp: new Date().toISOString(),
                    });
                },
            }),
        );
    }

    private isSensitiveOperation(method: string, url: string): boolean {
        const sensitivePatterns = [
            '/auth/login',
            '/auth/register',
            '/users',
            '/reservations',
        ];

        // Log POST, PUT, PATCH, DELETE operations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return true;
        }

        // Log access to sensitive endpoints
        return sensitivePatterns.some((pattern) => url.includes(pattern));
    }
}
