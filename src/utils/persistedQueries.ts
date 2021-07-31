import { usePersistedOperations, PersistedOperationsStore, readOperationId } from "@envelop/persisted-operations";
import { parse } from "graphql";

import env from "../env";
import queries from './extracted_queries';

const data = Object.keys(queries).reduce((acc, key) => {
    acc[queries[key]] = parse(key);
    return acc;
}, {});

export function getPersistedPlugin() {
    return usePersistedOperations({
        // Disable non-persisted queries only in non-development
        onlyPersistedOperations: true,//env.NODE_ENV !== "development",
        store: {
            canHandle: (key) => {
                const matches = key.match(/\s(\w+)/);
                const name = matches?.[1] || key;
                return !!data[name];
            },
            get: key => {
                const matches = key.match(/\s(\w+)/);
                const name = matches?.[1] || key;
                return data[name];
            }
        },
    });
}
