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
import { Entity, Snapshot, Diff } from '../utils';

export interface StorageStrategy {
    upsertSnapshot(snapshot: Snapshot): Snapshot;
    upsertDiff(diff: Diff): Diff;
    findLatestSnapshotBefore(id: string, timestamp: Date, entity: Entity): Snapshot;
    findLatestDiffBefore(id: string, timestamp: Date, entity: Entity): Diff;
}
