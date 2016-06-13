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
import { StorageStrategy } from '../storage/StorageStrategy';

export class Chrobject {

    entity: Entity;
    config: Configuration;
    appService: EntryAppService;

    constructor(entity: Entity, config: Configuration, storage: StorageStrategy) {
        this.entity = entity;
        this.config = config;
        this.appService = new EntryAppService(entity, storage);
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
