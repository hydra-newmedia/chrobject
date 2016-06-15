/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 15.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

export interface IDeepDiff {
    action: DiffAction; // 'created' | 'edited' | 'deleted' | 'array'
    created?: boolean; // true | undefined
    edited?: boolean; // true | undefined
    deleted?: boolean; // true | undefined
    array?: boolean; // true | undefined
    propertyPath: string; // 'path.to.prop'
    oldValue?: any; // value before update (only set if action in [ 'edited' | 'deleted' | 'array' ])
    newValue?: any; // value after update (only set if action in [ 'created' | 'edited' | ])
    arrayDiffs?: ArrayDiff[]; // array of diffs in array (only set if action 'array')
}

export type DiffAction = 'created' | 'edited' | 'deleted' | 'array';

export class ArrayDiff {
    action: ArrayAction;
    added: boolean;
    removed: boolean;
    index: number;
    value: any;

    constructor(action: ArrayAction, index: number, value: any) {
        this.action = action;
        this.added = action === 'added' ? true : undefined;
        this.removed = action === 'removed' ? true : undefined;
        this.index = index;
        this.value = value;
    }
}

export type ArrayAction = 'added' | 'removed';