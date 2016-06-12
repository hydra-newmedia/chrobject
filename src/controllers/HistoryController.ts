/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 11.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

/**
 *  Imports
 */
import { Entity, Configuration, Creator, Diff, Snapshot } from '../utils';
import { EntryAppService } from '../appservices/EntryAppService';

export class HistoryController {

    private entity: Entity;
    private config: Configuration;
    private appService: EntryAppService;

    constructor(entity: Entity, config: Configuration) {
        this.entity = entity;
        this.config = config;
        this.appService = new EntryAppService(entity);
    }

    saveEntry(obj: Object, creator: Creator, timestamp?: Date): { snapshot?: Snapshot, diff?: Diff } {
        if (!timestamp) {
            timestamp = new Date();
        }
        switch (this.config) {
            case Configuration.SNAP_AND_DIFF:
                return this.appService.saveSnapshotAndDiff(obj, creator, timestamp);
            case Configuration.SNAP_ONLY:
                return { snapshot: this.appService.saveSnapshot(obj, creator, timestamp) };
            case Configuration.DIFF_ONLY:
                return { diff: this.appService.saveDiff(obj, creator, timestamp) };
        }
    }

}
