import type { LeaderElector } from 'broadcast-channel';
import { AddReturn } from 'unload';
import { SylvieSaveQueue } from '../../plugins/storage-sylviejs/sylvie-save-queue.ts';

export type SylvieDatabaseSettings = any;

export type SylvieCollectionSettings = Partial<any>;

export type SylvieSettings = {
    database?: SylvieDatabaseSettings;
    collection?: SylvieCollectionSettings;
};

export type SylvieStorageInternals = {
    leaderElector?: LeaderElector;
    localState?: Promise<SylvieLocalDatabaseState>;
};

export type SylvieRemoteRequestBroadcastMessage = {
    response: false;
    type: string;
    databaseName: string;
    collectionName: string;
    operation: string;
    params: any[];
    requestId: string;
};

export type SylvieRemoteResponseBroadcastMessage = {
    response: true;
    type: string;
    databaseName: string;
    collectionName: string;
    requestId: string;
    result: any | any[];
    // if true, the result property will contain an error state
    isError: boolean;
};

export type SylvieDatabaseState = {
    database: any;
    databaseSettings: SylvieDatabaseSettings;
    saveQueue: SylvieSaveQueue;

    // all known collections of the database
    collections: {
        [collectionName: string]: any;
    };

    /**
     * Registered unload handlers
     * so we can remove them on close.
     */
    unloads: AddReturn[];
};

export type SylvieLocalDatabaseState = {
    databaseState: SylvieDatabaseState;
    collection: any;
};
