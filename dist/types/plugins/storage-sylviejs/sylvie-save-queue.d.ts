import type { SylvieDatabaseSettings } from '../../types/index.d.ts';
/**
 * The autosave feature of sylviejs has strange behaviors
 * and often runs a save in critical moments when other
 * more important tasks are running.
 * So instead we use a custom save queue that ensures we
 * only run sylvie.saveDatabase() when nothing else is running.
 */
export declare class SylvieSaveQueue {
    readonly sylvieDatabase: any;
    readonly databaseSettings: SylvieDatabaseSettings;
    writesSinceLastRun: number;
    /**
     * Ensures that we do not run multiple saves
     * in parallel
     */
    saveQueue: Promise<void>;
    saveQueueC: number;
    constructor(sylvieDatabase: any, databaseSettings: SylvieDatabaseSettings);
    addWrite(): void;
    run(): Promise<void>;
}
