import fastify from 'fastify';
import {
    getGraphQLParameters,
    processRequest,
    renderGraphiQL,
    shouldRenderGraphiQL,
} from 'graphql-helix';
import {
    envelop,
    useAsyncSchema,
    useExtendContext,
} from '@envelop/core';
import { makeSchema } from './utils/makeSchema';
import env from './env';
import { log, ServerInstance } from './utils';
import { gqlUpload } from './utils/gqlUpload';
import { getPlugins } from './utils/getPlugins';
import { Plugin } from '@envelop/core';


const instance: ServerInstance = {
    cleanup: () => Promise.reject('Not started'),
};

export const getInstance = () => instance;

const extendedContext = useExtendContext(ctx => ({
    getInstance,
    log,
}));

type PluginContext<T> = T extends Plugin<infer U> ? U : T;
export type ExtendedContext = PluginContext<typeof extendedContext>;

export const getEnvelopedSchema = () => {
    const schema = makeSchema();
    return {
        getEnveloped: envelop({
            plugins: [
                useAsyncSchema(schema),
                extendedContext,
                ...getPlugins(),
            ],
        }),
        schema,
    }
}

export const start = async (PORT: number | string) => {
    try {
        const app = fastify();
        const { getEnveloped } = getEnvelopedSchema();
        
        app.register(gqlUpload, {
            maxFileSize: 200000000
        });

        app.route({
            method: ["GET", "POST"],
            url: "/graphql",
            async handler(req, res) {
                const { parse, validate, contextFactory, execute, schema, subscribe } = getEnveloped({ req });
                const request = {
                    body: req.body,
                    headers: req.headers,
                    method: req.method,
                    query: req.query,
                };
    
                if (shouldRenderGraphiQL(request)) {
                    res.type("text/html");
                    res.send(renderGraphiQL());
                } else {
                    const { operationName, query, variables } = getGraphQLParameters(request);

                    const result = await processRequest({
                        operationName,
                        query,
                        variables,
                        request,
                        schema,
                        parse,
                        validate,
                        execute,
                        subscribe,
                        contextFactory,
                    });

                    if (result.type === 'RESPONSE') {
                        result.headers.forEach(({ name, value }) => res.header(name, value));
                        res.status(result.status);
                        res.send(result.payload);
                    } else if (result.type === 'MULTIPART_RESPONSE') {
                        res.raw.writeHead(200, {
                            Connection: 'keep-alive',
                            'Content-Type': 'multipart/mixed; boundary="-"',
                            'Transfer-Encoding': 'chunked',
                        });
    
                        req.raw.on('close', () => {
                            result.unsubscribe();
                        });
    
                        res.raw.write('---');
    
                        await result.subscribe((result) => {
                            const chunk = Buffer.from(JSON.stringify(result), 'utf8');
                            const data = [
                                '',
                                'Content-Type: application/json; charset=utf-8',
                                'Content-Length: ' + String(chunk.length),
                                '',
                                chunk,
                            ];
    
                            if (result.hasNext) {
                                data.push('---');
                            }
    
                            res.raw.write(data.join('\r\n'));
                        });
    
                        res.raw.write('\r\n-----\r\n');
                        res.raw.end();
                    } else {
                        res.raw.writeHead(200, {
                            'Content-Type': 'text/event-stream',
                            Connection: 'keep-alive',
                            'Cache-Control': 'no-cache',
                        });
    
                        req.raw.on('close', () => {
                            result.unsubscribe();
                        });
    
                        await result.subscribe((result) => {
                            res.raw.write(`data: ${JSON.stringify(result)}\n\n`);
                        });
                    }
                }
            }
        });
        app.listen(PORT, "0.0.0.0", (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log(`GraphQL server is running on port ${PORT}.`);
        });
        instance.cleanup = async () => {
            try {
                await app.close();
                return true;
            } catch (e) {
                return false;
            }
        };
        return instance;
    } catch (err) {
        log(err, "error");
        process.exit(1);
    }
}

process.on("uncaughtException", error => {
    log(error, "error");
});
process.on("unhandledRejection", error => {
    log("UnhandledRejection", "error", { error });
});

if (require.main === module) {
    start(env.PORT);
}
