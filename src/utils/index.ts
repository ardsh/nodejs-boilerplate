import debugFunc from 'debug';
import { Request } from 'graphql-helix';

export const debug = debugFunc('true');
type LogType = "error" | "warn" | "info";

export const log: (msg, type?: LogType, info?) => void = console.log;

export interface ServerInstance {
    cleanup: () => Promise<boolean>,
    // reloadSchema: () => Promise<boolean>,
}

export interface Context {
    getInstance: () => ServerInstance,
    log: typeof log,
    auth: any,
    req: Request
}