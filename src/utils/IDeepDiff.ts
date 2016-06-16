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
import { ArrayDiff } from './ArrayDiff';

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
