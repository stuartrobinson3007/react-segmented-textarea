'use client';

import React, {
  HTMLAttributes,
  createContext,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import deepEqual from 'fast-deep-equal';
import WordOverlays from './WordOverlays';
import { css, setup } from 'goober';

setup(React.createElement);

import {
  DragHandle,
  WordPositions,
  Mode,
  Segment,
  SegmentWithIndexes,
  WordRefFnProps,
} from '../types';
import HMTLToSegments from '../HTMLToSegments';
import { getCaretPosition, restoreCaretPosition } from '../caretPositions';
import calculateWordPositions from '../calculateWordPositions';
import addIndexesToSegments from '../addIndexesToSegments';
import getNewSegmentsAfterDrag from '../getNewSegmentsAfterDrag';
import DragHandler from './DragHandler';
import {
  DndContext,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { modifiedClosestCorners } from '../modifiedClosestCorners';
import InnerHTML, { getHTMLString } from './InnerHTML';

export const TextEditorContext = createContext({
  mode: 'edit' as Mode,
  segmentsWhileDragging: [] as SegmentWithIndexes[],
  lockInSegment: () => {},
  wordPositions: {} as WordPositions,
  segmentsWithIndexes: [] as SegmentWithIndexes[],
  dragHandleComponent: null as React.ReactElement | null,
  dragIndicatorComponent: null as React.ReactElement | null,
  splitIndicatorComponent: null as React.ReactElement | null,
  dragOverlayCursor: null as React.ReactElement | null,
  currentDragHandle: null as DragHandle | null,
  setCurrentDragHandle: (dragHandle: DragHandle | null) => {},
  splitSegment: (index: number) => {},
  resetSplit: () => {},
});

type TextEditorProps = {
  contentEditableRef: React.RefObject<HTMLDivElement>;
  segments: Segment[];
  setSegments: (segments: Segment[]) => void;
  onChange?: (segments: Segment[]) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  segmentStyle: React.CSSProperties;
  segmentBorderColors: string[];
  segmentBackgroundColors: string[];
  segmentTextColors: string[];
  dragHandleComponent: React.ReactElement;
  dragIndicatorComponent: React.ReactElement;
  splitIndicatorComponent: React.ReactElement;
  dragOverlayCursor: React.ReactElement;
  screenReaderInstructions: string;
};

// To prevent rerenders when the user edits the text in the contentEditable div we compare the updated segments passed in from higher up with the actual spans in the DOM
const propsAreEqual = (
  prevProps: TextEditorProps,
  nextProps: TextEditorProps
) => {
  if (nextProps.mode !== 'edit') return false;

  const contentEditableRef = prevProps.contentEditableRef?.current;

  if (!contentEditableRef) return false;

  // We get the segments from the DOM after the user has edited the text
  const DOMSegments = HMTLToSegments(contentEditableRef);

  // We get the segments from the props passed in from higher up (which come updated from the function that's triggered whenever the user manually edits the text)
  const updatedSegments = addIndexesToSegments(nextProps.segments); // TODO, this could be optimized

  return (
    // Only rerender if the segments are different or the user has changed the mode
    deepEqual(DOMSegments, updatedSegments) && prevProps.mode === nextProps.mode
  );
};

// We use memo to prevent rerenders when the user edits the text in the contentEditable div
const TextEditor = memo(
  ({
    contentEditableRef,
    segments,
    setSegments,
    onChange,
    mode,
    setMode,
    segmentStyle,
    segmentBorderColors,
    segmentBackgroundColors,
    segmentTextColors,
    dragHandleComponent,
    dragIndicatorComponent,
    splitIndicatorComponent,
    dragOverlayCursor,
    screenReaderInstructions,
    ...props
  }: TextEditorProps & HTMLAttributes<HTMLDivElement>) => {
    const sensors = useSensors(
      useSensor(MouseSensor),
      useSensor(TouchSensor),
      useSensor(KeyboardSensor)
    );

    const segmentsWithIndexes = useMemo(
      () => addIndexesToSegments(segments),
      [segments]
    );

    useEffect(() => {
      if (mode === 'edit') return;

      setSegmentsWhileDragging(segmentsWithIndexes);
    }, [mode, segmentsWithIndexes]);

    const words = useMemo(
      () =>
        segmentsWithIndexes
          .map(({ text }) => text)
          .join(' ')
          .split(' '),
      [segmentsWithIndexes]
    );

    const [segmentsWhileDragging, setSegmentsWhileDragging] =
      useState(segmentsWithIndexes);

    const [currentDragHandle, setCurrentDragHandle] =
      useState<DragHandle | null>(null);

    const [wordPositions, setWordPositions] = useState<WordPositions>({});

    useEffect(() => {
      const initContentEditableDiv = async () => {
        if (!contentEditableRef.current) {
          return;
        }

        const innerHTML = await getHTMLString({
          mode: 'edit',
          segmentsWithIndexes,
          segmentStyle,
          colors: {
            segmentBackgroundColors,
            segmentBorderColors,
            segmentTextColors,
          },
        });

        contentEditableRef.current.innerHTML = innerHTML;
      };

      mode === 'edit' && initContentEditableDiv();
    }, [
      contentEditableRef,
      mode,
      segmentBackgroundColors,
      segmentBorderColors,
      segmentTextColors,
      segmentStyle,
      segmentsWithIndexes,
    ]);

    const wordRefs = useRef<{
      [id: string]: {
        el: HTMLSpanElement;
        relativeWordIndex: number;
      }[];
    }>({});

    const updateWordPositions = useCallback(() => {
      // if (!isDragging) return;

      const newWordPositions = calculateWordPositions(wordRefs.current);

      if (!newWordPositions) return;

      setWordPositions((prevWordPositions) => {
        const isSame = deepEqual(prevWordPositions, newWordPositions);

        // Only update if they're different
        return isSame ? prevWordPositions : newWordPositions;
      });
    }, [wordRefs]);

    useEffect(() => {
      window.addEventListener('resize', updateWordPositions);
      updateWordPositions();

      // Cleanup the event listener on component unmount
      return () => {
        window.removeEventListener('resize', updateWordPositions);
      };
    }, [updateWordPositions]);

    const handleChange = useCallback(
      (segmentsWithIndexes: SegmentWithIndexes[]) => {
        const segments = segmentsWithIndexes.map((segment) => ({
          id: segment.id,
          text: segment.text,
        }));
        onChange && onChange(segments);
        setSegments(segments);
      },
      [onChange, setSegments]
    );

    const handleInput = useCallback(async () => {
      if (!contentEditableRef.current) {
        return;
      }

      const cursorPosition = getCaretPosition(contentEditableRef);

      const newSegments = HMTLToSegments(contentEditableRef.current);

      if (!newSegments) {
        return;
      }

      const html = await getHTMLString({
        mode: 'edit',
        segmentsWithIndexes: newSegments,
        segmentStyle,
        colors: {
          segmentBackgroundColors,
          segmentBorderColors,
          segmentTextColors,
        },
      });

      contentEditableRef.current.innerHTML = html;
      handleChange(newSegments);

      if (!cursorPosition) {
        return;
      }

      restoreCaretPosition(contentEditableRef, cursorPosition);
    }, [
      contentEditableRef,
      handleChange,
      segmentBackgroundColors,
      segmentBorderColors,
      segmentTextColors,
      segmentStyle,
    ]);

    const handleBlur = useCallback(() => {
      if (!contentEditableRef.current) {
        return;
      }

      let newSegments = HMTLToSegments(contentEditableRef.current);

      // Trim all the segments
      newSegments = newSegments.map((segment) => ({
        ...segment,
        text: segment.text.trim(),
      }));

      handleChange(newSegments);
    }, [contentEditableRef, handleChange]);

    const [isDraggingLeft, setIsDraggingLeft] = useState(false);

    const updateSegment = useCallback(
      ({
        segmentIndex,
        wordIndex,
        wordSide,
        dragHandleSide,
      }: {
        segmentIndex: number;
        wordIndex: number;
        wordSide: 'left' | 'right';
        dragHandleSide: 'left' | 'right';
      }) => {
        const { newSegments, isDraggingLeft } = getNewSegmentsAfterDrag({
          segmentsWithIndexes: segmentsWithIndexes,
          segmentIndex,
          wordIndex,
          wordSide,
          dragHandleSide,
        });

        setSegmentsWhileDragging(newSegments);
        setIsDraggingLeft(isDraggingLeft);
      },
      [segmentsWithIndexes]
    );

    const lockInSegment = useCallback(() => {
      handleChange(segmentsWhileDragging);
    }, [handleChange, segmentsWhileDragging]);

    const wordRefFn = useCallback(
      ({ el, wordIndex }: WordRefFnProps) => {
        if (wordIndex === 0) {
          wordRefs.current = {};
        }

        if (!el) return;

        const segmentId = segmentsWithIndexes.find(
          ({ startWordIndex, endWordIndex }) =>
            startWordIndex <= wordIndex && endWordIndex >= wordIndex
        )?.id;

        if (!segmentId) return;

        const { startWordIndex } = segmentsWithIndexes.find(
          ({ id }) => id === segmentId
        )!;

        const relativeWordIndex = wordIndex - startWordIndex;

        const totalWords = words.length;

        const isLastWord = wordIndex === totalWords - 1;

        const updatedWords = wordRefs.current[segmentId]
          ? [
              ...wordRefs.current[segmentId].filter(
                ({ relativeWordIndex: index }) => index !== relativeWordIndex
              ),
              {
                el,
                relativeWordIndex,
              },
            ]
          : [
              {
                el,
                relativeWordIndex,
              },
            ];

        wordRefs.current = {
          ...wordRefs.current,
          [segmentId]: updatedWords,
        };

        if (isLastWord) {
          updateWordPositions();
        }
      },
      [segmentsWithIndexes, words, updateWordPositions]
    );

    function handleDragStart(event: DragStartEvent) {
      const { active } = event;

      if (!active.data.current) return;

      const { segmentIndex, side } = active.data.current;

      setCurrentDragHandle({
        segmentIndex,
        side,
      });
    }

    function handleDragOver(event: DragOverEvent) {
      if (!event.active.data.current || !event.over?.data.current) return;

      const droppableOverlay = event.over.data.current;
      const dragHandle = currentDragHandle;

      if (!dragHandle) return;

      updateSegment({
        segmentIndex: dragHandle.segmentIndex,
        wordIndex: droppableOverlay.wordIndex,
        wordSide: droppableOverlay.side,
        dragHandleSide: dragHandle.side,
      });
    }

    function handleDragEnd() {
      lockInSegment();
      setCurrentDragHandle(null);
    }

    function handleDragCancel() {
      setSegmentsWhileDragging(segmentsWithIndexes);
      setCurrentDragHandle(null);
    }

    const splitSegment = useCallback(
      (index: number) => {
        const segmentIndex = segmentsWithIndexes.findIndex(
          ({ startWordIndex, endWordIndex }) =>
            startWordIndex <= index && endWordIndex >= index
        );

        const currentSegment = segmentsWithIndexes[segmentIndex];

        if (!currentSegment) return;

        // If the current segment is only one word, don't split it
        if (currentSegment.startWordIndex === currentSegment.endWordIndex)
          return;

        // If the user is trying to split on the first or last word of the segment, don't split it
        if (index === currentSegment.startWordIndex) return;

        const newSegmentIndexes = {
          id: Math.random().toString(36).substr(2, 9),
          startWordIndex: index,
          endWordIndex: currentSegment.endWordIndex,
          text: words.slice(index).join(' '),
        };

        currentSegment.endWordIndex = index - 1;

        const newSegmentsIndexes = [...segmentsWithIndexes];

        const fullText = words.join(' ');

        newSegmentsIndexes.splice(segmentIndex + 1, 0, newSegmentIndexes);

        const newSegments = newSegmentsIndexes.map(
          ({ id, startWordIndex, endWordIndex }) => ({
            id,
            startWordIndex,
            endWordIndex,
            text: fullText
              .split(' ')
              .slice(startWordIndex, endWordIndex + 1)
              .join(' '),
          })
        );

        setSegmentsWhileDragging(newSegments);

        handleChange(newSegments);
      },
      [handleChange, segmentsWithIndexes, words]
    );

    const resetSplit = useCallback(() => {
      setSegmentsWhileDragging(segmentsWithIndexes);
    }, [segmentsWithIndexes]);

    return (
      <TextEditorContext.Provider
        value={{
          mode,
          segmentsWhileDragging,
          lockInSegment,
          wordPositions,
          segmentsWithIndexes,
          currentDragHandle,
          setCurrentDragHandle,
          dragHandleComponent,
          dragIndicatorComponent,
          splitIndicatorComponent,
          dragOverlayCursor,
          splitSegment,
          resetSplit,
        }}
      >
        {mode === 'edit' ? (
          <div
            key="edit"
            ref={contentEditableRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={handleBlur}
            onPaste={(e) => {
              if (mode !== 'edit') return;

              e.preventDefault();

              const text = e.clipboardData.getData('text/plain');

              document.execCommand('insertText', false, text);
            }}
            {...props}
          />
        ) : (
          <div {...props}>
            <DndContext
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragCancel={handleDragCancel}
              sensors={sensors}
              collisionDetection={modifiedClosestCorners}
              accessibility={{
                screenReaderInstructions: {
                  draggable: screenReaderInstructions,
                },
              }}
            >
              <div
                // className="relative"
                className={css`
                  position: relative;
                `}
              >
                <InnerHTML
                  mode={mode}
                  segmentsWithIndexes={segmentsWhileDragging}
                  segmentStyle={segmentStyle}
                  colors={{
                    segmentBackgroundColors,
                    segmentBorderColors,
                    segmentTextColors,
                  }}
                  wordRefFn={wordRefFn}
                  colorOffest={
                    isDraggingLeft
                      ? Math.max(
                          segmentsWithIndexes.length -
                            segmentsWhileDragging.length,
                          0
                        )
                      : 0
                  }
                />

                {(mode === 'drag' || mode === 'split') && <WordOverlays />}

                {mode === 'drag' && <DragHandler />}
              </div>
            </DndContext>
          </div>
        )}
      </TextEditorContext.Provider>
    );
  },
  propsAreEqual
);

export { TextEditor };
