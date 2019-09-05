import { EclatMicroserviceStrategy } from '@eclat/server';
import { BadRequestException, Type } from '@nestjs/common';
import { CustomTransportStrategy, MessageHandler } from '@nestjs/microservices';
import { ApolloError, ApolloServer, mergeSchemas } from 'apollo-server-fastify';
import { plainToClass } from 'class-transformer';
import { createNamespace, getNamespace, Namespace } from 'cls-hooked';
import * as fastify from 'fastify';
import { GraphQLSchema } from 'graphql';
import { processRequest } from 'graphql-upload';
import { IncomingMessage, Server as NodeServer, ServerResponse } from 'http';
import { noop } from 'rxjs';

export class LogiqueStrategy extends EclatMicroserviceStrategy implements CustomTransportStrategy {
    private server: fastify.FastifyInstance<NodeServer, IncomingMessage, ServerResponse>;
    private options: { port: number; schemas: GraphQLSchema[] };

    public constructor(options: { port?: number; schemas?: GraphQLSchema[] } = {}) {
        super({
            skipMissingProperties: false,
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true
        });
        this.options = {
            port: options.port || 8000,
            schemas: options.schemas || []
        };
        this.server = fastify({});
        this.configureServer();
    }

    public close(): Promise<unknown> {
        return new Promise(resolve => {
            this.server.close(resolve);
        });
    }

    public async listen(cb: () => void = noop): Promise<unknown> {
        const graphql: ApolloServer = new ApolloServer({
            introspection: true,
            playground: true,
            schema: mergeSchemas({
                schemas: [
                    ...this.options.schemas,
                    await this.getSchema()
                ]
            }),
            tracing: true,
            cacheControl: true,
            engine: false,
            context: ({ req }) => {
                return {
                    request: req
                };
            }
        });
        this.server.register(graphql.createHandler());

        return this.server.listen(this.options.port, '0.0.0.0', cb);
    }

    private configureServer(): void {
        this.server.setErrorHandler((error, request, reply) => {
            if (error instanceof ApolloError) {
                const { extensions, ...rest } = error;
                reply.code(error.extensions.code || 500).send({
                    message: error.message,
                    extensions: JSON.parse(
                        JSON.stringify({
                            ...extensions,
                            exception: {
                                ...rest,
                                stacktrace: error.stack
                            }
                        })
                    )
                });
            } else {
                reply.send(error);
            }
        });

        this.server.use(async (request, response, next) => {
            if (request.headers['content-type'] !== 'multipart/form-data') {
                return next();
            }

            const finished: Promise<boolean> = new Promise(resolve => request.on('end', resolve));

            const { end } = response;
            response.end = (...args) => {
                finished.then(() => {
                    response.end = end;
                    response.end(...args);
                });
            };

            processRequest(request, response, {})
                .then(body => {
                    request['body'] = body;
                    next();
                })
                .catch(error => {
                    if (error.status && error.expose) {
                        response.statusCode = error.status;
                    }
                    next(error);
                });
        });

        this.server.all('/', async (req, res) => {
            const messageType: string = req.headers['x-message-type'] as string;

            const handler: MessageHandler | null = this.getHandlerByPattern(messageType);
            if (!handler) {
                throw new BadRequestException();
            }

            const messageClass: Type<object> = this.getMessageClassByName(messageType);

            return this.runInContext(
                plainToClass(messageClass, req.body),
                handler,
                { request: req },
            );
        });
    }
}
