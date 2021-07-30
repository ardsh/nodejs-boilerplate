import { InMemoryLiveQueryStore } from "@n1ru4l/in-memory-live-query-store";
import { useLiveQuery } from "@envelop/live-query";

export const liveQueryStore = new InMemoryLiveQueryStore();

export function getLiveQueryPlugin() {
    return useLiveQuery({
        liveQueryStore,
    });
}
