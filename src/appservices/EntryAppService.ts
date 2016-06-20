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

    saveSnapshotAndDiff(obj: Object, creator: Creator, timestamp: Date,
                        callback: (err: Error, result?: { snapshot?: Snapshot, diff?: Diff }) => void) {
        let id: string = _.get<string>(obj, this.entity.idPath);
        this.storage.findLatestSnapshotBefore(id, timestamp, this.entity, (err: Error, oldSnap: Snapshot) => {
            if (err) {
                return callback(err);
            }
            let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp);
            this.storage.insertSnapshot(newSnap, (err: Error, newSnap: Snapshot) => {
                let diff: Diff;
                if (err) {
                    return callback(err);
                } else if (oldSnap) {
                    diff = this.diff(oldSnap, newSnap);
                } else {
                    let blankSnap: Snapshot = new Snapshot({}, this.entity, creator, timestamp);
                    diff = this.diff(blankSnap.setObjId(newSnap.objId), newSnap);
                }
                diff.linkToId(newSnap.id);
                this.storage.insertDiff(diff, (err: Error, diff: Diff) => {
                    if (callback) {
                        callback(err, { snapshot: newSnap, diff: diff });
                    }
                });
            });
        });
    }

    saveSnapshot(obj: Object, creator: Creator, timestamp: Date, callback: (err: Error, snapshot?: Snapshot) => void) {
        let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp);
        this.storage.insertSnapshot(newSnap, callback);
    }

    saveDiff(obj: Object, creator: Creator, timestamp: Date, callback: (err: Error, diff?: Diff) => void) {
        let id: string = _.get<string>(obj, this.entity.idPath);
        this.storage.findLatestSnapshotBefore(id, timestamp, this.entity, (err: Error, oldSnap: Snapshot) => {
            if (err) {
                return callback(err);
            }
            let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp, oldSnap ? oldSnap.id : undefined);
            this.storage.upsertSnapshot(newSnap, (err: Error, newSnap: Snapshot) => {
                let diff: Diff;
                if (err) {
                    return callback(err);
                } else if (oldSnap) {
                    diff = this.diff(oldSnap, newSnap);
                } else {
                    let blankSnap: Snapshot = new Snapshot({}, this.entity, creator, timestamp);
                    diff = this.diff(blankSnap.setObjId(newSnap.objId), newSnap);
                }
                this.storage.insertDiff(diff, callback ? callback : undefined);
            });
        });
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
            } else if (_.isBoolean(one[key]) || _.isDate(one[key]) || _.isNumber(one[key])
                || _.isNull(one[key]) || _.isRegExp(one[key]) || _.isString(one[key])) {
                if (!_.has(two, key)) {
                    result.push(new DeepDiff('deleted', concatPath, one[key], null));
                } else if (_.get(one, key) !== _.get(two, key)) {
                    result.push(new DeepDiff('edited', concatPath, one[key], two[key]));
                }
            } else if (_.isArray(one[key]) && _.isArray(two[key]) && !_.isEqual(one[key], two[key])) {
                result.push(new DeepDiff('array', concatPath, one[key], two[key]));
            } else if (!_.has(two, key)) {
                result.push(new DeepDiff('deleted', concatPath, one[key], null));
            }
        }
        for (var key of _.keys(two)) {
            let concatPath: string = path ? path + '.' + key : key;
            if (!_.has(one, key)) {
                if (_.isPlainObject(two[key]) || _.isBoolean(two[key]) || _.isDate(two[key]) || _.isNumber(two[key])
                    || _.isNull(two[key]) || _.isRegExp(two[key]) || _.isString(two[key]) || _.isArray(two[key])) {
                    result.push(new DeepDiff('created', concatPath, null, two[key]));
                }
            }
        }
        return result;
    }
}
