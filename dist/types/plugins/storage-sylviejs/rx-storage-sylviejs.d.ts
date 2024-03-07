import type { SylvieDatabaseSettings, SylvieSettings, SylvieStorageInternals, RxStorage, RxStorageInstanceCreationParams } from '../../types/index.d.ts';
import { RxStorageInstanceSylvie } from './rx-storage-instance-sylvie.ts';
import type { LeaderElector } from 'broadcast-channel';
export declare class RxStorageSylvie implements RxStorage<SylvieStorageInternals, SylvieSettings> {
    databaseSettings: SylvieDatabaseSettings;
    name: string;
    readonly rxdbVersion = "15.10.0";
    /**
     * Create one leader elector by db name.
     * This is done inside of the storage, not globally
     * to make it easier to test multi-tab behavior.
     */
    leaderElectorBySylvieDbName: Map<string, {
        leaderElector: LeaderElector;
        /**
         * Count the instances that currently use the elector.
         * If is goes to zero again, the elector can be closed.
         */
        instancesCount: number;
    }>;
    constructor(databaseSettings: SylvieDatabaseSettings);
    createStorageInstance<RxDocType>(params: RxStorageInstanceCreationParams<RxDocType, SylvieSettings>): Promise<RxStorageInstanceSylvie<RxDocType>>;
}
export declare function getRxStorageSylvie(databaseSettings?: SylvieDatabaseSettings): RxStorageSylvie;
