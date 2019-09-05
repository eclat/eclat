import {
    OptimisticLockingSubscriber,
    TransactionManagerInterceptor,
    TreeEntitiesBuilderSubscriber,
    ValueObject
} from '@eclat/server';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entity, getManager, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent, TreeRepository } from 'typeorm';
import { HelloHandler } from './hello';
import { LoggingInterceptor } from './logging.interceptor';
import { UserRepository } from './user.repository';

@Entity()
@Tree('materialized-path')
export class User extends ValueObject {
    @PrimaryGeneratedColumn('increment')
    public readonly id: number;

    @TreeChildren({ cascade: true })
    children: User[];

    @TreeParent()
    parent: User;

    public constructor() {
        super();
    }
}

export class DefaultTreeEntitiesBuilderSubscriber extends TreeEntitiesBuilderSubscriber {
}

export class DefaultOptimisticLockingSubscriber extends OptimisticLockingSubscriber {
}

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: 'postgres://sa:rahasia1234@neuffa-commerce-staging-db.cyyhrocdiy9w.ap-southeast-1.rds.amazonaws.com/test',
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
        { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
        DefaultTreeEntitiesBuilderSubscriber
    ]
})
export class AppModule {
    public constructor() {
        setTimeout(async () => {
            const user1 = new User();
            const user2 = new User();
            const user3 = new User();
            const user4 = new User();
            const user5 = new User();
            const user6 = new User();
            user4.children = [
                user5,
                user6
            ];
            user2.children = [
                user3,
                user4
            ];

            user1.children = [
                user2,
                user4
            ];
            const repo: TreeRepository<User> = getManager().getTreeRepository(User);

            // await repo.remove(await repo.findOne({ id: 221 }));

            await repo.save(user1);
            // const child = await repo.findOne({ id: 246 });
            // const parent = await repo.findOne({ id: 250 });
            //
            // child.parent = parent;
            //
            // await repo.save(child);

        }, 3000);
    }
}
