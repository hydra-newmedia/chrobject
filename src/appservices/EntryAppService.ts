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
import { Entity, Snapshot, Diff, Creator } from '../utils';
import { StorageStrategy } from '../storage/StorageStrategy';

export class EntryAppService {
    entity: Entity;
    storage: StorageStrategy;

    constructor(entity: Entity) {
        this.entity = entity;
    }

    saveSnapshotAndDiff(obj: Object, creator: Creator, timestamp: Date): { snapshot: Snapshot, diff: Diff } {
        let id: string = _.get<string>(obj, this.entity.idPath);
        let oldSnap: Snapshot = this.storage.findLatestSnapshotBefore(id, timestamp, this.entity);
        let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp);
        newSnap = this.storage.upsertSnapshot(newSnap);
        let diff: Diff = this.diff(oldSnap, newSnap);
        diff = this.storage.upsertDiff(diff);
        return { snapshot: newSnap, diff: diff };
    }

    saveSnapshot(obj: Object, creator: Creator, timestamp: Date): Snapshot {
        let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp);
        return this.storage.upsertSnapshot(newSnap);
    }

    saveDiff(obj: Object, creator: Creator, timestamp: Date): Diff {
        let id: string = _.get<string>(obj, this.entity.idPath);
        let oldSnap: Snapshot = this.storage.findLatestSnapshotBefore(id, timestamp, this.entity);
        let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp, oldSnap.id);
        newSnap = this.storage.upsertSnapshot(newSnap);
        let diff: Diff = this.diff(oldSnap, newSnap);
        diff.linkToId(newSnap.id);
        return this.storage.upsertDiff(diff);
    }

    private diff(snapOne: Snapshot, snapTwo: Snapshot): Diff {
        // TODO: check order (timebased), check if same entity
        // TODO: object diff between snapOne.obj and snapTwo.obj
        return new Diff({}, snappTwo.entity, snapTwo.creator, snapTwo.timestamp);
    }
}
