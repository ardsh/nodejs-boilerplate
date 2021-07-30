import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { processRequest } from 'graphql-upload';

export const gqlUpload = fp((fastify: FastifyInstance, options, done) => {
    fastify.addContentTypeParser('multipart', async (req) => {
        req.isMultipart = true;
    });

    fastify.addHook('preValidation', async function(request, reply) {
        if (!(request.raw as any).isMultipart) {
            return;
        }
        request.body = await processRequest(request.raw, reply.raw, options);
    });

    done();
});
