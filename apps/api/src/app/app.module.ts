import { OptimisticLockingSubscriber, TransactionManagerInterceptor, ValueObject } from '@eclat/server';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { InjectConnection, TypeOrmModule } from '@nestjs/typeorm';
import { Connection, Entity, getConnection, PrimaryGeneratedColumn } from 'typeorm';
import { HelloHandler } from './hello';
import { LoggingInterceptor } from './logging.interceptor';
import { UserRepository } from './user.repository';

@Entity()
export class User extends ValueObject {
    @PrimaryGeneratedColumn('uuid')
    public readonly id: string;

    public constructor() {
        super();
    }
}

export class DefaultOptimisticLockingSubscriber extends OptimisticLockingSubscriber {
    public constructor(@InjectConnection() conn: Connection) {
        super(conn);
    }
}

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: '',
            entities: [User],
            logging: true,
            synchronize: true,
            extra: {
                min: 1,
                max: 1
            }
        })
    ],
    controllers: [HelloHandler],
    providers: [
        UserRepository,
        {
            provide: APP_INTERCEPTOR,
            useClass: TransactionManagerInterceptor
        },
        DefaultOptimisticLockingSubscriber,
        { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }
    ]
})
export class AppModule {
}

