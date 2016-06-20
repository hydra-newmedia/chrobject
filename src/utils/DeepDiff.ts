/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 15.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

/**
 *  Imports
 */
import * as _ from 'lodash';
import * as hash from 'object-hash';
import { IDeepDiff, DiffAction } from './IDeepDiff';
import { ArrayDiff } from './ArrayDiff';

export class DeepDiff implements IDeepDiff {
    action: DiffAction;
    created: boolean;
    edited: boolean;
    deleted: boolean;
    array: boolean;
    propertyPath: string;
    oldValue: any;
    newValue: any;
    arrayDiffs: ArrayDiff[];

    constructor(action: DiffAction, propertyPath: string, oldValue: any, newValue: any) {
        this.action = action;
        this.created = action === 'created' ? true : undefined;
        this.edited = action === 'edited' ? true : undefined;
        this.deleted = action === 'deleted' ? true : undefined;
        this.array = action === 'array' ? true : undefined;
        this.propertyPath = propertyPath;
        this.oldValue = oldValue && action !== 'created' ? oldValue : undefined;
        this.newValue = newValue && action !== 'deleted' ? newValue : undefined;
        if (action === 'array') {
            this.setArrayDiffs(oldValue, newValue);
        }
    }

    setArrayDiffs(one: any[], two: any[]): void {
        this.arrayDiffs = [];

        let processedItems: { [key: string]: number[] } = {};

        let addToProcessed = (alreadyDoneMap: { [key: string]: number[] }, valHash: string, idx: number) => {
            if (_.has(alreadyDoneMap, valHash)) {
                alreadyDoneMap[valHash].push(idx);
            } else {
                alreadyDoneMap[valHash] = [idx];
            }
        };

        // indexOf function which checks for object hash equality instead of using SameValueZero
        let indexOf = (array: any[], value: any, fromIndex?: number): number => {
            let startIndex: number = fromIndex ? fromIndex : 0;
            for (var i = startIndex; i < array.length; i++) {
                if (hash(array[i]) === hash(value)) {
                    return i;
                }
            }
            return -1;
        };

        // loop through first array to find deletions and index changes
        for (var idxInOne = 0; idxInOne < one.length; idxInOne++) {
            let val: any = one[idxInOne];
            // check whether item is in second array
            if (indexOf(two, val) >= 0) {
                // check whether already processed a similar item
                let valHash: string = hash(val);
                // get idx in second array where the last processed item was moved to
                let idxLastMovedTo: number = _.has(processedItems, valHash) ? _.last<number>(processedItems[valHash]) + 1 : undefined;
                // search from there on
                let idxMovedTo: number = indexOf(two, val, idxLastMovedTo);
                if (idxInOne === idxMovedTo) {
                    // if element stayed, just add it to processed elements
                    addToProcessed(processedItems, valHash, idxInOne);
                } else if (idxMovedTo >= 0) {
                    // if moved, add it to processed elements and output change
                    addToProcessed(processedItems, valHash, idxMovedTo);
                    this.arrayDiffs.push(new ArrayDiff('moved', idxInOne, val, idxMovedTo));
                } else {
                    // if no such element found, output deletion
                    this.arrayDiffs.push(new ArrayDiff('removed', idxInOne, val));
                }
            } else {
                // if not found at all, output deletion
                this.arrayDiffs.push(new ArrayDiff('removed', idxInOne, val));
            }
        }

        // loop through second array to find additions in comparison to first array
        for (var idxInTwo = 0; idxInTwo < two.length; idxInTwo++) {
            let val: any = two[idxInTwo];
            let valHash: string = hash(val);
            // check if element is not in processed elements map or if it is, then not at the same position
            if (!_.has(processedItems, valHash) || _.indexOf(processedItems[valHash], idxInTwo) < 0) {
                // output additions
                this.arrayDiffs.push(new ArrayDiff('added', idxInTwo, val));
            }
        }
    }
}
