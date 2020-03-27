import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import express, { Application } from 'express';

import { DataSource } from './data-source';
import { Context } from './graphql/context';
import { schema } from './graphql/schema';

export interface StartServerOptions {
    port: number;
    enableTracing: boolean;
    enablePlayground: boolean;
}

const dataSource = new DataSource();

export async function startServer({ port, enableTracing, enablePlayground }: StartServerOptions): Promise<Application> {
    const server = new ApolloServer({
        context: (): Context => ({
            dataSource,
        }),
        schema,
        tracing: enableTracing,
        playground: enablePlayground,
        introspection: enablePlayground,
    });

    const app = express();
    app.use(compression());

    server.applyMiddleware({
        app,
        path: '/',
    });

    return new Promise<Application>(resolve => {
        app.listen(port, () => {
            resolve(app);
        });
    });
}
