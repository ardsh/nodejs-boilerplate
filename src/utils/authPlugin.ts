import { ResolveUserFn, useGenericAuth, ValidateUserFn } from '@envelop/generic-auth';
import jwt from 'jsonwebtoken';
import env from '../env';

import { Context } from './index';

export type UserType = {
    id: string
    name?: string
};

export function validateToken(token: string): Promise<UserType> {
    return new Promise((res, rej) => {
        jwt.verify(token?.replace('Bearer ', ''), env.APP_SECRET, { }, function (err, decoded) {
            if (!err && decoded) {
                res(decoded as UserType);
            } else {
                rej(err);
            }
        });
    });
}

export function signUserToken(object: UserType) {
    return jwt.sign(object, env.APP_SECRET, { expiresIn: 3600*24 });
}

const resolveUserFn: ResolveUserFn<UserType, Context> = async (ctx) => {
    // Here you can implement any custom sync/async code, and use the context built so far in Envelop and the HTTP request
    // to find the current user.
    // Common practice is to use a JWT token here, validate it, and use the payload as-is, or fetch the user from an external services.
    // Make sure to either return `null` or the user object.

    const auth = ctx.req.headers['authorization'];
    return validateToken(auth).catch(err => {
        console.error('Failed to validate token:', err);
        return null;
    });
};
const validateUser: ValidateUserFn<UserType, Context> = async (user, ctx, params, directiveNode) => {
    // Here you can implement any custom to check if the user is valid and have access to the server.
    // This method is being triggered in different flows, based on the mode you chose to implement.
  
    // If you are using the `protect-auth-directive` mode, you'll also get 2 additional parameters: the resolver parameters as object and the DirectiveNode of the auth directive.

    if (!user) {
        throw new Error(`Unauthenticated!`);
    }
};

export function getAuthPlugin() {
    return useGenericAuth<UserType, Context>({
        resolveUserFn,
        validateUser,
        mode: 'resolve-only',
        contextFieldName: 'auth',
    });
}
