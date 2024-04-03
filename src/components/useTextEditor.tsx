import { useRef, useState } from 'react';
import { Segment, Mode } from '../types';
import { instructions } from '../accessibility';

function useTextEditor({
  defaultSegments,
  defaultMode = 'edit',
  segmentStyle,
  segmentBorderColors,
  segmentBackgroundColors,
  segmentTextColors,
  dragHandleComponent,
  dragIndicatorComponent,
  splitIndicatorComponent,
  dragOverlayCursor,
  screenReaderInstructions,
}: {
  defaultSegments: Segment[];
  defaultMode?: Mode;
  segmentStyle: React.CSSProperties;
  segmentBorderColors: string[];
  segmentBackgroundColors: string[];
  segmentTextColors: string[];
  dragHandleComponent: React.ReactElement;
  dragIndicatorComponent: React.ReactElement;
  splitIndicatorComponent: React.ReactElement;
  dragOverlayCursor: React.ReactElement;
  screenReaderInstructions?: string;
}) {
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
    screenReaderInstructions: screenReaderInstructions || instructions,
  };
}

export { useTextEditor };
