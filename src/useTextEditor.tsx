import { useRef, useState } from 'react';
import { Segment, Mode } from './types';
import { instructions } from './accessibility';
import {
  DefaultDragHandle,
  DefaultDragIndicator,
  DefaultDragOverlayCursor,
  DefaultSplitIndicator,
  defaultBackgroundColors,
  defaultBorderColors,
  defaultSegmentStyle,
  defaultTextColors,
} from './defaults';

function useTextEditor({
  defaultSegments = [],
  defaultMode = 'edit',
  segmentStyle = defaultSegmentStyle,
  segmentBorderColors = defaultBorderColors,
  segmentBackgroundColors = defaultBackgroundColors,
  segmentTextColors = defaultTextColors,
  dragHandleComponent = <DefaultDragHandle />,
  dragIndicatorComponent = <DefaultDragIndicator />,
  splitIndicatorComponent = <DefaultSplitIndicator />,
  dragOverlayCursor = <DefaultDragOverlayCursor />,
  screenReaderInstructions = instructions,
}: {
  defaultSegments?: Segment[];
  defaultMode?: Mode;
  segmentStyle?: React.CSSProperties;
  segmentBorderColors?: string[];
  segmentBackgroundColors?: string[];
  segmentTextColors?: string[];
  dragHandleComponent?: React.ReactElement;
  dragIndicatorComponent?: React.ReactElement;
  splitIndicatorComponent?: React.ReactElement;
  dragOverlayCursor?: React.ReactElement;
  screenReaderInstructions?: string;
} = {}) {
  const [segments, setSegments] = useState(defaultSegments);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  return {
    segments,
    mode,
    setSegments,
    setMode,
    contentEditableRef,
    segmentStyle,
    segmentBorderColors,
    segmentBackgroundColors,
    segmentTextColors,
    dragHandleComponent,
    dragIndicatorComponent,
    splitIndicatorComponent,
    dragOverlayCursor,
    screenReaderInstructions,
  };
}

export { useTextEditor };
