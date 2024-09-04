export interface SliceInterface {
  start: number;
  end?: number;
}

// BoundedSlices must have the 'end' property
export type BoundedSlices<T = SliceInterface> = Required<T>[];

// UnboundedSlices must have the 'end' property but the last one
export type UnboundedSlices<T = SliceInterface> = [...BoundedSlices<T>, T];
