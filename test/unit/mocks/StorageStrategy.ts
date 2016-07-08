/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 13.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

/**
 *  Imports
 */
import * as _ from 'lodash';
import * as chrobject from '../../../lib';
import { IDeepDiff } from '../../../lib';
import { DeepDiff } from '../../../lib/utils/DeepDiff';
import { FindDiffsCondition } from '../../../lib/storage/StorageStrategy';
import { Entity } from '../../../lib/utils/Entity';

export class StorageStrategy implements chrobject.StorageStrategy {
    testSnapObj: Object = {
        my: {
            identificator: 'abcdef'
        },
        data: {
            a: 'aValue',
            no: 'nope'
        },
        arr: ['a', 'few', 'elements'],
        delArr: ['a', 'b', 'c'],
        flipchartArr: ['a', 'b', 'c', 'd', 'e']
    };
    testSnapObj2: Object = {
        my: {
            identificator: 'abcdef'
        },
        addedKey: { added: 'lö' },
        data: {
            a: 'aEditedValue',
            b: 'createdValue'
        },
        arr: ['a', 'few', 'more', 'elements', { than: 'before' }],
        delArr: ['a', 'c'],
        flipchartArr: ['a', 'c', 'f', 'e', 'x']
    };
    testDiffObj: IDeepDiff[] = [
        new DeepDiff('edited', 'data.a', 'aValue', 'aEditedValue'),
        new DeepDiff('deleted', 'data.no', 'nope', null),
        new DeepDiff('created', 'data.b', null, 'createdValue'),
        new DeepDiff('array', 'arr', ['a', 'few', 'elements'], ['a', 'few', 'more', 'elements', { than: 'before' }]),
        new DeepDiff('array', 'delArr', ['a', 'b', 'c'], ['a', 'c']),
        new DeepDiff('array', 'flipchartArr', ['a', 'b', 'c', 'd', 'e'], ['a', 'c', 'f', 'e', 'x']),
        new DeepDiff('created', 'addedKey', null, { added: 'lö' })
    ];
    creator: chrobject.Creator = new chrobject.Creator('username', 'sourceapp');
    foundSnapshot: chrobject.Snapshot = new chrobject.Snapshot(
        this.testDiffObj,
        new chrobject.Entity('testEntity', 'unknown'),
        this.creator,
        new Date()
    ).setObjId(_.get<string>(this.testDiffObj, 'my.identificator'));

    oneMinuteBefore(timestamp: Date): Date {
        return new Date(timestamp.valueOf() - 60000);
    }

    findSnapshotById(id: string, entity: Entity, callback: (err: Error, snapshot?: chrobject.Snapshot) => void) {
        callback(null, this.foundSnapshot.setId(id));
    }

    findDiffsByCondition(condition: FindDiffsCondition, entity: chrobject.Entity,
                         callback: (err: Error, diffs?: chrobject.Diff[]) => void) {
        callback(null);
    }

    insertSnapshot(snapshot: chrobject.Snapshot, callback: (err: Error, snapshot: chrobject.Snapshot) => void) {
        callback(null, snapshot.clone().setId('0011223344'));
    }

    upsertSnapshot(snapshot: chrobject.Snapshot, callback: (err: Error, snapshot: chrobject.Snapshot) => void) {
        callback(null, snapshot.clone().setId(snapshot.id ? snapshot.id : '0123456789'));
    }

    insertDiff(diff: chrobject.Diff, callback: (err: Error, diff: chrobject.Diff) => void) {
        callback(null, diff.clone().setId('1234567890'));
    }

    findLatestSnapshotBefore(id: string, timestamp: Date, entity: chrobject.Entity,
                             callback: (err: Error, snapshot: chrobject.Snapshot) => void) {
        if (id === 'noSnapBefore') {
            callback(null, null);
        } else {
            callback(null, new chrobject.Snapshot(this.testSnapObj, entity, this.creator, this.oneMinuteBefore(timestamp), '0100000000'));
        }
    }

    findLatestDiffBefore(id: string, timestamp: Date, entity: chrobject.Entity, callback: (err: Error, diff: chrobject.Diff) => void) {
        callback(null, new chrobject.Diff(this.testDiffObj, _.get<string>(this.testDiffObj, entity.idPath),
            entity, this.creator, this.oneMinuteBefore(timestamp), '0200000000'));
    }
}
