import { QueryHandler } from '@eclat/server';
import { IsNotEmpty, IsUppercase, MaxLength } from 'class-validator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArgsType, Field } from 'type-graphql';
import { User } from './app.module';
import { UserRepository } from './user.repository';

@ArgsType()
export class Hello {
    @Field()
    @IsNotEmpty()
    @IsUppercase()
    @MaxLength(16)
    public name!: string;
}


@QueryHandler({ messageType: Hello, returnType: String })
export class HelloHandler {
    public constructor(private repository: UserRepository) {
    }

    public handle(dto: Hello): Observable<number> {
        return this.repository.save(new User()).pipe(map(e => e.id));
    }
}
