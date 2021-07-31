import debugFunc from 'debug';
import { Request } from 'graphql-helix';
import { ExtendedContext } from '..';
import { UserType } from './authPlugin';

export const debug = debugFunc('true');
type LogType = "error" | "warn" | "info";

export const log: (msg, type?: LogType, info?) => void = console.log;

export interface ServerInstance {
    cleanup: () => Promise<boolean>,
    // reloadSchema: () => Promise<boolean>,
}

export interface Context extends ExtendedContext {
    [key: string]: unknown,
    validateUser: () => Promise<void>
    auth: UserType,
    req: Request
}