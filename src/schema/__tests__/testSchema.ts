import { processRequest } from "graphql-helix";
import _ from "lodash";
import { getEnvelopedSchema } from "../..";
import { signUserToken, UserType } from "../../utils/authPlugin";

type QueryResult = {
    data?: any,
    subscribe?: (onResult: (result: any) => void) => Promise<void>;
    unsubscribe?: () => void;
};

export function testSchema(user?: UserType) {
    const { getEnveloped, schema } = getEnvelopedSchema();

    const req = {
        headers: {},
    }
    const signUser = ((user) => {
        req.headers = {
            ...req.headers,
            authorization: signUserToken(user),
        };
    }) as typeof signUserToken;

    if (user) signUser(user);

    return {
        signUser,
        processQuery: async (query: string, variables?: any, operationName?: string): Promise<QueryResult> => {
            const { parse, validate, contextFactory, execute, subscribe } = getEnveloped({ req });

            const result = await processRequest({
                operationName,
                query,
                variables,
                request: {
                    headers: req.headers,
                    method: 'POST',
                    query,
                },
                schema: await schema,
                parse,
                validate,
                execute,
                subscribe,
                contextFactory,
            });
            if (result.type === 'RESPONSE') {
                return result.payload;
            } else {
                return _.pick(result, 'type', 'subscribe', 'unsubscribe');
            }
        }
    }
}
