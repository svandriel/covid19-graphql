import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import express, { Application } from 'express';

import { Context } from './graphql/context';
import { schema } from './graphql/schema';

export interface StartServerOptions {
    port: number;
    isProduction: boolean;
}

export async function startServer({ port, isProduction }: StartServerOptions): Promise<Application> {
    const server = new ApolloServer({
        context: (): Context => ({}),
        schema,
        tracing: !isProduction,
        playground: !isProduction
    });

    const app = express();
    app.use(compression());

    server.applyMiddleware({
        app,
        path: '/'
    });

    return new Promise<Application>(resolve => {
        app.listen(port, () => {
            resolve(app);
        });
    });
}
