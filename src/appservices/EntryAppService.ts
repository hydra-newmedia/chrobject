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
import { diff } from 'deep-diff';
import { Entity } from '../utils/Entity';
import { Snapshot } from '../utils/Snapshot';
import { Diff } from '../utils/Diff';
import { Creator } from '../utils/Creator';
import { StorageStrategy } from '../storage/StorageStrategy';

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

    private diff(snapOne: Snapshot, snapTwo: Snapshot): Diff {
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
        let diffObj: FormatedDeepDiff[] = this.formatDeepDiffObj(diff(snapOne.obj, snapTwo.obj));

        return new Diff(diffObj, snapTwo.entity, snapTwo.creator, snapTwo.timestamp);
    }

    private formatDeepDiffObj(deepDiff: DeepDiff[]): FormatedDeepDiff[] {
        return _.map<DeepDiff, FormatedDeepDiff>(deepDiff, (value: DeepDiff): FormatedDeepDiff => {
                let path = value.path.join('.');
                switch (_.get(value, 'kind')) {
                    case 'N':
                        return {
                            action: 'created',
                            created: true,
                            propertyPath: path,
                            newValue: value.rhs
                        };
                    case 'E':
                         return {
                            action: 'edited',
                            edited: true,
                            propertyPath: path,
                            oldValue: value.lhs,
                            newValue: value.rhs
                        };
                    case 'D':
                        return {
                            action: 'deleted',
                            deleted: true,
                            propertyPath: path,
                            newValue: value.rhs
                        };
                    case 'A':
                        switch (value.item.kind) {
                            case 'N':
                                return {
                                    action: 'added',
                                    edited: true,
                                    propertyPath: path,
                                    newValue: value.rhs
                                };
                            case 'D':
                                return {
                                    action: 'removed',
                                    edited: true,
                                    propertyPath: path,
                                    oldValue: value.lhs
                                };
                        }
                }
            });
    }
}

interface DeepDiff {
    kind: string;
    path: Array<string>;
    lhs?: any;
    rhs?: any;
    index?: number;
    item?: DeepDiff;
}

interface FormatedDeepDiff {
    action: DiffAction;
    created?: boolean;
    edited?: boolean;
    deleted?: boolean;
    propertyPath: string;
    oldValue?: any;
    newValue?: any;
}

type DiffAction = 'created' | 'edited' | 'deleted' | 'added' | 'removed';
