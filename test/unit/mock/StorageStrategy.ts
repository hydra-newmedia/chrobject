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
import * as chrobject from '../../../lib';

export class StorageStrategy implements chrobject.StorageStrategy {
    testSnapObj: Object = {
        my: {
            identificator: 'abcdef'
        },
        data: {
            a: 'aValue',
            no: 'nope'
        },
        arr: ['a', 'b', 'd']
    };
    testDiffObj: Object[] = [
        {
            action: 'created',
            created: true,
            propertyPath: 'data.b',
            newValue: 'createdValue'
        },
        {
            action: 'edited',
            edited: true,
            propertyPath: 'data.a',
            oldValue: 'aValue',
            newValue: 'aEditedValue'
        },
        {
            action: 'deleted',
            deleted: true,
            propertyPath: 'data.no',
            oldValue: 'nope',
        },
        {
            action: 'added',
            edited: true,
            propertyPath: 'arr',
            newValue: 'c'
        },
        {
            action: 'removed',
            edited: true,
            propertyPath: 'arr',
            oldValue: 'd'
        }
    ];
    creator: chrobject.Creator = new chrobject.Creator('username', 'sourceapp');

    oneMinuteBefore(timestamp: Date): Date {
        return new Date(timestamp.valueOf() - 60000);
    }
    
    insertSnapshot(snapshot: chrobject.Snapshot): chrobject.Snapshot {
        return snapshot.clone().setId('0011223344');
    }

    upsertSnapshot(snapshot: chrobject.Snapshot): chrobject.Snapshot {
        return snapshot.clone().setId('0123456789');
    }

    insertDiff(diff: chrobject.Diff): chrobject.Diff {
        return diff.clone().setId('1234567890');
    }

    findLatestSnapshotBefore(id: string, timestamp: Date, entity: chrobject.Entity): chrobject.Snapshot {
        return new chrobject.Snapshot(this.testSnapObj, entity, this.creator, this.oneMinuteBefore(timestamp), '0100000000');
    }

    findLatestDiffBefore(id: string, timestamp: Date, entity: chrobject.Entity): chrobject.Diff {
        return new chrobject.Diff(this.testDiffObj, entity, this.creator, this.oneMinuteBefore(timestamp), '0200000000');
    }
}
