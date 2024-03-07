import type {
    SylvieDatabaseSettings,
    SylvieSettings,
    SylvieStorageInternals,
    RxStorage,
    RxStorageInstanceCreationParams
} from '../../types/index.d.ts';
import {
    createSylvieStorageInstance,
    RxStorageInstanceSylvie
} from './rx-storage-instance-sylvie.ts';
import { RX_STORAGE_NAME_SYLVIEJS } from './sylviejs-helper.ts';
import type { LeaderElector } from 'broadcast-channel';

import { ensureRxStorageInstanceParamsAreCorrect } from '../../rx-storage-helper.ts';
import { RXDB_VERSION } from '../utils/utils-rxdb-version.ts';

export class RxStorageSylvie implements RxStorage<SylvieStorageInternals, SylvieSettings> {
    public name = RX_STORAGE_NAME_SYLVIEJS;
    public readonly rxdbVersion = RXDB_VERSION;

    /**
     * Create one leader elector by db name.
     * This is done inside of the storage, not globally
     * to make it easier to test multi-tab behavior.
     */
    public leaderElectorBySylvieDbName: Map<string, {
        leaderElector: LeaderElector;
        /**
         * Count the instances that currently use the elector.
         * If is goes to zero again, the elector can be closed.
         */
        instancesCount: number;
    }> = new Map();

    constructor(
        public databaseSettings: SylvieDatabaseSettings
    ) { }

    public createStorageInstance<RxDocType>(
        params: RxStorageInstanceCreationParams<RxDocType, SylvieSettings>
    ): Promise<RxStorageInstanceSylvie<RxDocType>> {
        ensureRxStorageInstanceParamsAreCorrect(params);
        return createSylvieStorageInstance(this, params, this.databaseSettings);
    }
}

export function getRxStorageSylvie(
    databaseSettings: SylvieDatabaseSettings = {}
): RxStorageSylvie {
    const storage = new RxStorageSylvie(databaseSettings);
    return storage;
}
