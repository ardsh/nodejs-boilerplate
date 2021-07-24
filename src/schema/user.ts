import { registerResolver } from ".";

registerResolver({
    Query: {
        async me(parent, args, ctx, info) {
            return ctx.auth;
        }
    }
});
