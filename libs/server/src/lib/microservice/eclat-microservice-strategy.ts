import { Type } from '@nestjs/common';
import { MessageHandler, Server } from '@nestjs/microservices';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';
import { GraphQLSchema } from 'graphql';
import { Arg, Args, buildSchema, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage';
import { MetadataStorage } from 'type-graphql/dist/metadata/metadata-storage';
import { RequestContext } from '../request-context/request-context';
import { MESSAGE_METADATA } from './eclat-message.metadata';
import { getHandlerTypeByName, getMessageClassByName, getReturnTypeByName } from './eclat-microservice-message-locator';

export abstract class EclatMicroserviceStrategy<C extends object = object> extends Server {
    protected constructor(private validatorOptions?: ValidatorOptions, private inputFieldName: string = 'input') {
        super();
    }

    public getSchema(): Promise<GraphQLSchema> {
        return buildSchema({
            resolvers: Array.from(this.getHandlers().entries()).map(([messageName, handler]) =>
                this.getResolverClass(
                    messageName,
                    handler
                )
            ),
            validate: false
        });
    }

    public async runInContext(message: unknown, handler: MessageHandler, contextInitialData: object = {}): Promise<unknown> {
        this.logger.verbose(message);
        const validationErrors: ValidationError[] = await validate(message, this.validatorOptions);

        if (validationErrors.length) {
            throw validationErrors[0];
        }

        return new Promise((resolve, reject) => {
            this.send(RequestContext.runInContext(() => handler(message), {
                ...contextInitialData,
                [MESSAGE_METADATA]: message
            }), data => {
                this.logger.verbose(data);
                if (data.err) {
                    reject(data.err);
                } else if (data.response) {
                    resolve(data.response);
                } else {
                    reject(data);
                }
            });
        });
    }

    public getMessageClassByName(messageName: string): Type<any> {
        return getMessageClassByName(messageName);
    }

    private getResolverClass<T>(messageName: string, handler: MessageHandler): Type<unknown> {
        const handlerType: string = getHandlerTypeByName(messageName);

        const messageClass: Type<T> = getMessageClassByName(messageName);
        const metadataStorage: MetadataStorage = getMetadataStorage();

        const graphqlRunner: (msg: T, graphqlContext: C) => Promise<unknown> = (msg: T, graphqlContext: C) => {
            return this.runInContext(
                msg,
                handler,
                graphqlContext
            );
        };

        const ResolverArg: () => ParameterDecorator = () => {
            if (metadataStorage.argumentTypes.some(v => v.target === messageClass)) {
                return Args(type => messageClass);
            }
            return Arg(this.inputFieldName, type => messageClass);
        };

        // tslint:disable-next-line:max-classes-per-file
        @Resolver()
        class BaseResolver {
            @Query(returns => Boolean)
            public ping(): boolean {
                return true;
            }

            public async handle(
                @ResolverArg() data: object,
                @Ctx() ctx: C
            ): Promise<unknown> {
                return graphqlRunner(
                    plainToClass(
                        messageClass,
                        data
                    ),
                    ctx
                );
            }
        }

        const name: string = messageName.charAt(0).toLowerCase() + messageName.slice(1);
        const propertyDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
            BaseResolver.prototype,
            'handle'
        );

        if (!propertyDescriptor) {
            throw new Error('should not undefined');
        }

        const args: [object, string, PropertyDescriptor] = [
            BaseResolver.prototype,
            'handle',
            propertyDescriptor
        ];
        if (handlerType === 'mutation') {
            Mutation(
                returns => getReturnTypeByName(messageName),
                { name }
            )(
                ...args);
        } else if (handlerType === 'query') {
            Query(
                returns => getReturnTypeByName(messageName),
                { name }
            )(
                ...args);
        }

        return BaseResolver;
    }
}
