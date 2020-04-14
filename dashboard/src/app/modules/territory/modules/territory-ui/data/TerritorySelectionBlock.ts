export interface IdName {
  id: number;
  name: string;
}

export enum TerritorySelectionState {
  NONE = 0,
  SOME = 1,
  ALL = 2,
}

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function generateRandomTerritoryChildren(territoryB: TerritorySelectionBlock): Promise<void> {
  const len = Math.floor(Math.random() * 5 + 4);
  const children = new Array(len);
  for (let i = 0; i < len; i++) {
    const child = { id: Math.floor(Math.random() * 10000), name: territoryB.indent + ':' + uuidv4() };
    children[i] = child;
  }

  territoryB.setChildren(children);
}

export class TerritorySelectionBlock {
  id: number;
  parent_id: number;
  name: string;
  // selected: boolean;
  // indent:number;
  protected _children?: TerritorySelectionBlock[];
  protected _selectedState: TerritorySelectionState;
  // protected _parent?: TerritorySelectionBlock;

  public get parent(): TerritorySelectionBlock {
    return this._parent;
  }
  public get children(): TerritorySelectionBlock[] {
    return this._children;
  }
  public get indent(): number {
    return this._indent;
  }
  public get selectedState(): TerritorySelectionState {
    return this._selectedState;
  }

  constructor(base: IdName, protected _parent?: TerritorySelectionBlock, protected _indent = 0, selected = true) {
    this.id = base.id;
    this.name = base.name;
    this._selectedState = TerritorySelectionState.ALL;
    // this.updateSelectionState();
  }

  setSelected(selected: boolean, propagateToParent = true, propagateToChildren = true): void {
    this._selectedState = selected ? TerritorySelectionState.ALL : TerritorySelectionState.NONE;
    if (propagateToParent === true && this._parent !== undefined) {
      this._parent.setSelectedStateFromChildren(true);
    }

    if (propagateToChildren === true && this._children !== undefined) {
      for (const child of this._children) child.setSelectedStateFromParent(true);
    }
  }

  setSelectedStateFromChildren(propagateToParent = false): void {
    // let selectedElements = 0;
    // let childrenLength = this.children !== undefined ? this.children.length : 0;

    if (this._children !== undefined) {
      const selectedElementCount = this._children.filter(
        (child) => child._selectedState === TerritorySelectionState.ALL,
      ).length;
      if (selectedElementCount === this._children.length) {
        this._selectedState = TerritorySelectionState.ALL;
      } else if (selectedElementCount === 0) {
        this._selectedState = TerritorySelectionState.NONE;
      } else {
        this._selectedState = TerritorySelectionState.SOME;
      }
    } else {
      this._selectedState = TerritorySelectionState.ALL;
    }

    if (propagateToParent === true && this._parent !== undefined) {
      this._parent.setSelectedStateFromChildren(true);
    }
  }

  setSelectedStateFromParent(propagateToChildren = false): void {
    if (this._parent !== undefined && this._parent._selectedState !== TerritorySelectionState.SOME) {
      this._selectedState = this._parent._selectedState;
      if (this._children === undefined) {
        for (const child of this._children) child.setSelectedStateFromParent(true);
      }
    }
  }

  deleteChildren(displayList?: TerritorySelectionBlock[]): void {
    if (this._children !== undefined && this._children.length > 0 && displayList !== undefined) {
      const ind = displayList.indexOf(this._children[0]);
      if (ind !== -1) {
        displayList.splice(ind, this._children.length);
      }
    }
    delete this._children;
  }

  setChildren(childrenData: IdName[], displayList?: TerritorySelectionBlock[]): void {
    // sync display list if we remove
    this.deleteChildren(displayList);
    this._children = [];
    const displayListInd = displayList !== undefined ? displayList.indexOf(this) : -1;
    for (const childData of childrenData) {
      const child = new TerritorySelectionBlock(childData, this, this._indent + 1);
      child._parent = this;
      if (displayListInd !== -1) displayList.splice(displayListInd, 0, child);
      this._children.push(child);
    }
  }
}
