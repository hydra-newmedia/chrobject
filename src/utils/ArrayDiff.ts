/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 16.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

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
