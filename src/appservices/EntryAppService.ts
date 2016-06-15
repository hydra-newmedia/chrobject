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
import * as _ from 'lodash';
import { Entity } from '../utils/Entity';
import { Snapshot } from '../utils/Snapshot';
import { Diff } from '../utils/Diff';
import { Creator } from '../utils/Creator';
import { StorageStrategy } from '../storage/StorageStrategy';
import { IDeepDiff } from '../utils/IDeepDiff';
import { DeepDiff } from '../utils/DeepDiff';

export class EntryAppService {
    entity: Entity;
    storage: StorageStrategy;

    constructor(entity: Entity, storage: StorageStrategy) {
        this.entity = entity;
        this.storage = storage;
    }

    saveSnapshotAndDiff(obj: Object, creator: Creator, timestamp: Date): { snapshot: Snapshot, diff: Diff } {
        let id: string = _.get<string>(obj, this.entity.idPath);
        let oldSnap: Snapshot = this.storage.findLatestSnapshotBefore(id, timestamp, this.entity);
        let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp);
        newSnap = this.storage.insertSnapshot(newSnap);
        let diff: Diff = this.diff(oldSnap, newSnap);
        diff.linkToId(newSnap.id);
        diff = this.storage.insertDiff(diff);
        return { snapshot: newSnap, diff: diff };
    }

    saveSnapshot(obj: Object, creator: Creator, timestamp: Date): Snapshot {
        let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp);
        return this.storage.insertSnapshot(newSnap);
    }

    saveDiff(obj: Object, creator: Creator, timestamp: Date): Diff {
        let id: string = _.get<string>(obj, this.entity.idPath);
        let oldSnap: Snapshot = this.storage.findLatestSnapshotBefore(id, timestamp, this.entity);
        let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp, oldSnap.id);
        newSnap = this.storage.upsertSnapshot(newSnap);
        let diff: Diff = this.diff(oldSnap, newSnap);
        return this.storage.insertDiff(diff);
    }

    diff(snapOne: Snapshot, snapTwo: Snapshot): Diff {
        // Check if snapshots are of same object
        if (snapOne.objId !== snapTwo.objId) {
            throw new Error('Diffed snapshots are not of same object');
        }
        // Check if snapshots are of same entity
        if (!snapOne.entity.equals(snapTwo.entity)) {
            throw new Error('Diffed snapshots are not of same entity');
        }
        // swap snapshots if snapTwo was taken before snapOne
        if (snapOne.timestamp > snapTwo.timestamp) {
            let tmp = snapOne;
            snapOne = snapTwo;
            snapTwo = tmp;
        }

        // diff between the two snapshots
        let diffObj: IDeepDiff[] = this.deepDiff(snapOne.obj, snapTwo.obj);

        return new Diff(diffObj, snapTwo.objId, snapTwo.entity, snapTwo.creator, snapTwo.timestamp);
    }

    deepDiff(one: Object, two: Object, path: string = ''): IDeepDiff[] {
        let result: IDeepDiff[] = [];
        for (var key of _.keys(one)) {
            let concatPath: string = path ? path + '.' + key : key;
            if (_.isPlainObject(one[key])) {
                if (!_.has(two, key)) {
                    result.push(new DeepDiff('deleted', concatPath, one[key], null));
                } else {
                    result = _.concat(result, this.deepDiff(one[key], two[key], path ? path + '.' + key : key));
                }
            } if (_.isBoolean(one[key]) || _.isDate(one[key]) || _.isNumber(one[key])
                || _.isNull(one[key]) || _.isRegExp(one[key]) || _.isString(one[key])) {
                if (!_.has(two, key)) {
                    result.push(new DeepDiff('deleted', concatPath, one[key], null));
                } else if (_.get(one, key) !== _.get(two, key)) {
                    result.push(new DeepDiff('edited', concatPath, one[key], two[key]));
                }
            } else if (_.isArray(one[key]) && _.isArray(two[key]) && !_.isEqual(one[key], two[key])) {
                result.push(new DeepDiff('array', concatPath, one[key], two[key]));
            }
        }
        for (var key of _.keys(two)) {
            let concatPath: string = path ? path + '.' + key : key;
            if (!_.has(one, key)) {
                if (_.isPlainObject(two[key]) || _.isBoolean(two[key]) || _.isDate(two[key]) || _.isNumber(two[key])
                    || _.isNull(two[key]) || _.isRegExp(two[key]) || _.isString(two[key])) {
                    result.push(new DeepDiff('created', concatPath, null, two[key]));
                }
            }
        }
        return result;
    }
}
