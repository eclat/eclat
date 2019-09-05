import { AbstractRepository, DuckType } from '@eclat/server';
import { Injectable } from '@nestjs/common';
import { createNamespace, getNamespace, Namespace } from 'cls-hooked';
import { User } from './app.module';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
    protected entity: DuckType<User> = User;
}
