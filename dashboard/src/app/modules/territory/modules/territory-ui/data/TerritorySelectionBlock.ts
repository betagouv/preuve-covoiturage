import { BehaviorSubject, Observable } from 'rxjs';
import { UiStatusRelationDetails } from '../../../../../../../../shared/territory/relationUiStatus.contract';

export interface IdName {
  id: number;
  name: string;
}

export enum TerritorySelectionState {
  NONE = 0,
  SOME = 1,
  ALL = 2,
}

export interface TerritorySelectionUIState {
  id: number;
  state: TerritorySelectionState;
  children: TerritorySelectionUIState[];
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

  protected _selectedStateBehaviour: BehaviorSubject<TerritorySelectionState>;

  public get parent(): TerritorySelectionBlock {
    return this._parent;
  }
  public get children(): TerritorySelectionBlock[] {
    return this._children;
  }
  public get indent(): number {
    return this._indent;
  }
  // public get selectedState(): TerritorySelectionState {
  //   return this._selectedState;
  // }

  constructor(
    base: IdName,
    protected _parent?: TerritorySelectionBlock,
    protected _indent = 0,
    selectedState = TerritorySelectionState.ALL,
  ) {
    this.id = base.id;
    this.name = base.name;
    this._selectedState = selectedState;
    this._selectedStateBehaviour = new BehaviorSubject(this._selectedState);
    // this.updateSelectionState();
  }

  static fromUiRelation(
    element: UiStatusRelationDetails,
    parent?: TerritorySelectionBlock,
    indent = 0,
  ): TerritorySelectionBlock {
    const block = new this(element, parent, indent, element.state);
    // block._selectedState = element.state;
    if (element.children) {
      block._children = [];
      for (const child of element.children) {
        block._children.push(this.fromUiRelation(child, block, indent + 1));
      }
    }
    return block;
  }

  toIdName(): IdName {
    return { id: this.id, name: this.name };
  }

  getFlatSelectedList(list: IdName[] = []): IdName[] {
    switch (this._selectedState) {
      case TerritorySelectionState.ALL:
        list.push(this.toIdName());
        break;
      case TerritorySelectionState.SOME:
        if (this.children === undefined)
          throw new Error(
            'TerritorySelectionBlock : try to get some selected children from an undefined children array',
          );
        this.children.forEach((child) => child.getFlatSelectedList(list));

        break;
    }

    return list;
  }

  getSelectedStateObservable(): Observable<TerritorySelectionState> {
    return this._selectedStateBehaviour.asObservable();
  }

  getSelectionUIState(recursive = true): TerritorySelectionUIState {
    const selectionState: TerritorySelectionUIState = {
      id: this.id,
      state: this._selectedState,
      children: [],
    };
    if (recursive && this._children) {
      for (const child of this._children) {
        if (child._selectedState !== TerritorySelectionState.NONE)
          selectionState.children.push(
            child.getSelectionUIState(child._selectedState === TerritorySelectionState.SOME),
          );
      }
    }

    return selectionState;
  }

  setSelected(selected: boolean, propagateToParent = true, propagateToChildren = true): void {
    this._selectedState = selected ? TerritorySelectionState.ALL : TerritorySelectionState.NONE;
    if (propagateToParent === true && this._parent !== undefined) {
      this._parent.setSelectedStateFromChildren(true);
    }

    if (propagateToChildren === true && this._children !== undefined) {
      for (const child of this._children) child.setSelectedStateFromParent(true);
    }

    this._selectedStateBehaviour.next(this._selectedState);
  }

  setSelectedStateFromChildren(propagateToParent = false): void {
    // let selectedElements = 0;
    // let childrenLength = this.children !== undefined ? this.children.length : 0;
    if (this._children !== undefined) {
      const selectedElementCount = this._children.filter(
        (child) => child._selectedState === TerritorySelectionState.ALL,
      ).length;

      const someSelectedElementCount = this._children.filter(
        (child) => child._selectedState !== TerritorySelectionState.NONE,
      ).length;

      if (selectedElementCount === this._children.length) {
        this._selectedState = TerritorySelectionState.ALL;
      } else if (someSelectedElementCount === 0) {
        this._selectedState = TerritorySelectionState.NONE;
      } else {
        this._selectedState = TerritorySelectionState.SOME;
      }
    } else {
      this._selectedState = TerritorySelectionState.ALL;
    }

    this._selectedStateBehaviour.next(this._selectedState);

    if (propagateToParent === true && this._parent !== undefined) {
      this._parent.setSelectedStateFromChildren(true);
    }
  }

  setSelectedStateFromParent(propagateToChildren = false): void {
    if (this._parent !== undefined && this._parent._selectedState !== TerritorySelectionState.SOME) {
      this._selectedState = this._parent._selectedState;
      this._selectedStateBehaviour.next(this._selectedState);

      if (this._children !== undefined) {
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
