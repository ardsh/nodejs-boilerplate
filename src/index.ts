import fastify from 'fastify';
import {
    getGraphQLParameters,
    processRequest,
    renderGraphiQL,
    shouldRenderGraphiQL,
} from 'graphql-helix';
import { makeSchema } from './utils/makeSchema';
import env from './env';
import { log, ServerInstance } from './utils';
import { gqlUpload } from './utils/gqlUpload';

let instance: ServerInstance;

export const getInstance = () => instance;

const start = async (PORT: number | string) => {
    try {
        const app = fastify();

        const schema = makeSchema();

        app.register(gqlUpload, {
            maxFileSize: 200000000
        });
        app.route({
            method: ["GET", "POST"],
            url: "/graphql",
            async handler(req, res) {
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
                        schema: await schema,
                        contextFactory: () => ({
                            getInstance,
                            log,
                            req,
                        })
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
    
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`GraphQL server is running on port ${PORT}.`);
        });
        return instance = {
            cleanup: async () =>{
                try {
                    await app.close();
                    return true;
                } catch (e) {
                    return e;
                }
            },
        }
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
