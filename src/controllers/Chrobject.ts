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
import { Entity } from '../utils/Entity';
import { Diff } from '../utils/Diff';
import { Snapshot } from '../utils/Snapshot';
import { Configuration } from '../utils/Configuration';
import { Creator } from '../utils/Creator';
import { EntryAppService } from '../appservices/EntryAppService';
import {
    StorageStrategy,
    FindDiffsCondition
} from '../storage/StorageStrategy';

export class Chrobject {

    entity: Entity;
    config: Configuration;
    appService: EntryAppService;

    constructor(entity: Entity, config: Configuration, storage: StorageStrategy) {
        this.entity = entity;
        this.config = config;
        this.appService = new EntryAppService(entity, storage);
    }

    getDiffs(condition: FindDiffsCondition, callback: (err: Error, diffs?: Diff[]) => void) {
        this.appService.getDiffs(condition, callback);
    }

    getSnapshotById(id: string, callback: (err: Error, snapshot?: Snapshot) => void) {
        this.appService.getSnapshotById(id, callback);
    }

    saveEntry(obj: Object, creator: Creator, timestamp?: Date,
              callback?: (err: Error, result?: { snapshot?: Snapshot, diff?: Diff }) => void) {
        if (!timestamp) {
            timestamp = new Date();
        }
        switch (this.config) {
            case Configuration.SNAP_AND_DIFF:
                this.appService.saveSnapshotAndDiff(obj, creator, timestamp,
                    (err: Error, result?: { snapshot?: Snapshot, diff?: Diff }) => {
                    if (err && callback) {
                        callback(err);
                    } else if (callback) {
                        callback(null, result ? result : {});
                    }
                });
                break;
            case Configuration.SNAP_ONLY:
                this.appService.saveSnapshot(obj, creator, timestamp, (err: Error, snapshot?: Snapshot) => {
                    if (err && callback) {
                        callback(err);
                    } else if (callback) {
                        callback(null, { snapshot: snapshot });
                    }
                });
                break;
            case Configuration.DIFF_ONLY:
                this.appService.saveDiff(obj, creator, timestamp, (err: Error, diff?: Diff) => {
                    if (err && callback) {
                        callback(err);
                    } else if (callback) {
                        callback(null, { diff: diff });
                    }
                });
                break;
        }
    }

}
