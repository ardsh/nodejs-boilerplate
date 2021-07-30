import { useTiming } from "@envelop/core";
import { useGraphQlJit } from "@envelop/graphql-jit";
import { useParserCache } from "@envelop/parser-cache";
import { useValidationCache } from "@envelop/validation-cache";
import { useDisableIntrospection } from "@envelop/disable-introspection";

import { getPersistedPlugin } from "./persistedQueries";
import { getLiveQueryPlugin } from "./liveQuery";
import env from "../env";

export function getPlugins() {
    return [
        ...getGeneralPlugins(),
        ...(env.NODE_ENV !== "development" && getNonDevPlugins() || []),
        ...(env.NODE_ENV === "production" && getProductionPlugins() || []),
        ...(env.NODE_ENV === "development" && getDevelopmentPlugins() || []),
    ]
}

function getProductionPlugins() {
    return [
        //Improve performance
        useParserCache(),
        useValidationCache(),
        useGraphQlJit(),
    ]
}

function getGeneralPlugins() {
    return [
        getPersistedPlugin(),
        getLiveQueryPlugin(),
    ]
}

function getNonDevPlugins() {
    return [
        useDisableIntrospection(),
    ]
}
function getDevelopmentPlugins() {
    return [
        useTiming(),
    ]
}
