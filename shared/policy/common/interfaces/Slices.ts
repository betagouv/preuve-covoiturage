export interface SliceInterface {
  start: number;
  end?: number;
}

// BoundedSlices must have the 'end' property
export type BoundedSlices = Required<SliceInterface>[];

// UnboundedSlices must have the 'end' property but the last one
export type UnboundedSlices = [...BoundedSlices, SliceInterface];
