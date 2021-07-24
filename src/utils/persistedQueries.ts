import { usePersistedOperations, PersistedOperationsStore } from "@envelop/persisted-operations";
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
        onlyPersistedOperations: env.NODE_ENV !== "development",
        store: {
            canHandle: key => !!data[key],
            get: key => data[key],
        },
    });
}
