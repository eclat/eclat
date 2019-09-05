import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    public intercept(payload: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        return next.handle().pipe(
            tap(console.log, console.log)
        );
    }
}
