/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 16.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

export class ArrayDiff {
    action: ArrayDiffAction;
    added: boolean;
    moved: boolean;
    removed: boolean;
    index: number;
    oldIndex: number;
    newIndex: number;
    value: any;

    constructor(action: ArrayDiffAction, index: number, value: any, newIndex?: number) {
        this.action = action;
        this.added = action === 'added' ? true : undefined;
        this.moved = action === 'moved' ? true : undefined;
        this.removed = action === 'removed' ? true : undefined;
        this.oldIndex = action === 'moved' ? index : undefined;
        this.index = action !== 'moved' ? index : undefined;
        this.newIndex = action === 'moved' ? newIndex : undefined;
        this.value = value;
    }
}

export type ArrayDiffAction = 'added' | 'moved' | 'removed';
