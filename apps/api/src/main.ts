// tslint:disable:no-string-literal
import { INestMicroservice } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchema } from 'graphql';
import { AppModule } from './app/app.module';
import { LogiqueStrategy } from './app/logique-strategy';
import { environment } from './environments/environment';

(async () => {
    try {
        const port: number = 8000;
        const schemas: GraphQLSchema[] = await Promise.all([]);

        const strategy: LogiqueStrategy = new LogiqueStrategy({
            port,
            schemas
        });
        const microservice: INestMicroservice = await NestFactory.createMicroservice(AppModule, {
            strategy
        });
        microservice.listen(() => {
            console.log(`Listening on port: ${port}`);
        });


    } catch (e) {
        console.log(e);
        process.exit(1);
    }
})();

