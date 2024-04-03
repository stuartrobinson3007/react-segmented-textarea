export type Segment = {
  id: string;
  text: string;
};

export type SegmentWithIndexes = {
  id: string;
  text: string;
  startWordIndex: number;
  endWordIndex: number;
};

export type Mode = 'edit' | 'drag' | 'split';

export type SegmentPositions = {
  [id: string]: {
    start: number;
    end: number;
  };
};

export type DragHandle = {
  segmentIndex: number;
  side: 'left' | 'right';
};

export type WordPosition = {
  top: number;
  left: number;
  height: number;
  width: number;
};

export type WordPositions = {
  [id: string]: {
    left: WordPosition;
    right: WordPosition;
  }[];
};

export type WordRefFnProps = {
  el: HTMLSpanElement | null;
  wordIndex: number;
};

export type HandleSetSegmentRefProps = {
  id: string;
  side: 'start' | 'end';
  el: HTMLSpanElement | null;
};
