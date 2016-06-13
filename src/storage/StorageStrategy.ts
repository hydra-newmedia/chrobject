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
import { Snapshot } from '../utils/Snapshot';
import { Diff } from '../utils/Diff';

export interface StorageStrategy {
    insertSnapshot(snapshot: Snapshot): Snapshot;
    upsertSnapshot(snapshot: Snapshot): Snapshot;
    insertDiff(diff: Diff): Diff;
    findLatestSnapshotBefore(id: string, timestamp: Date, entity: Entity): Snapshot;
    findLatestDiffBefore(id: string, timestamp: Date, entity: Entity): Diff;
}
