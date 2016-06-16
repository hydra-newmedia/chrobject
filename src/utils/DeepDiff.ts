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
    arrayDiffs: { additions: ArrayDiff[], removals: ArrayDiff[] };

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
        this.arrayDiffs = { additions: [], removals: [] };
        let removed: number[] = [];
        for (var i = 0; i < one.length; i++) {
            if (two[i - removed.length] !== one[i]) {
                this.arrayDiffs.removals.push(new ArrayDiff(i, one[i]));
                removed.push(i);
            }
        }
        let shift: number = 0;
        for (var i = 0; i < two.length; i++) {
            if (removed.indexOf(i) > -1) {
                shift++;
            }
            if (one[i + shift] !== two[i]) {
                this.arrayDiffs.additions.push(new ArrayDiff(i, two[i]));
                shift--;
            }
        }
    }
}
