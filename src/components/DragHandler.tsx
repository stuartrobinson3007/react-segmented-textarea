import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TextEditorContext } from './TextEditor';
import React from 'react';
import { DragOverlay, useDndContext, useDraggable } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { css } from 'goober';
import { WordPosition } from '../types';
import DragOverlayCursor from './DragOverlayCursor';
import { createPortal } from 'react-dom';

const DragHandles = ({ segmentIndex }: { segmentIndex: number }) => {
  const { segmentsWithIndexes, wordPositions } = useContext(TextEditorContext);

  const segmentId = segmentsWithIndexes[segmentIndex].id;
  const nextSegmentId =
    segmentIndex < segmentsWithIndexes.length - 1
      ? segmentsWithIndexes[segmentIndex + 1].id
      : '';

  const ref = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const nodeCurrent = ref?.current;

    nodeCurrent?.addEventListener('mouseenter', handleMouseEnter);
    nodeCurrent?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      nodeCurrent?.removeEventListener('mouseenter', handleMouseEnter);
      nodeCurrent?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref]);

  const rightPosition =
    wordPositions[segmentId]?.[wordPositions[segmentId].length - 1].right;
  const leftPosition = wordPositions[nextSegmentId]?.[0].left;

  return (
    <div ref={ref} key={`segment-${segmentId}`}>
      {segmentIndex < segmentsWithIndexes.length - 1 && (
        <DragHandle
          position={rightPosition}
          segmentIndex={segmentIndex}
          side="right"
          isHovered={isHovered}
        />
      )}
      {segmentIndex < segmentsWithIndexes.length - 1 && (
        <DragHandle
          position={leftPosition}
          segmentIndex={segmentIndex + 1}
          side="left"
          isHovered={isHovered}
        />
      )}
    </div>
  );
};

export const KeepDragHandleInDOM = () => {
  const { segmentsWithIndexes, currentDragHandle } =
    useContext(TextEditorContext);

  const dndContext = useDndContext();

  const segmentIndex = dndContext.over?.data.current?.segmentIndex ?? -1;
  const id = segmentsWithIndexes[segmentIndex]?.id;
  const side = currentDragHandle?.side;

  const { setNodeRef, listeners, attributes } = useDraggable({
    id: `drag-handle-${id}-${side}`,
    data: { segmentIndex, side },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      key={`${id}-${side}`}
    />
  );
};

type DragHandleProps = {
  segmentIndex: number;
  side: 'left' | 'right';
  isHovered?: boolean;
  position?: WordPosition;
};

const DragHandle = ({
  position,
  segmentIndex,
  side,
  isHovered,
}: DragHandleProps) => {
  const { dragHandleComponent, dragIndicatorComponent } =
    useContext(TextEditorContext);

  const [isFocused, setIsFocused] = useState(false);

  const { setNodeRef, listeners, attributes } = useDraggable({
    id: `drag-handle-${segmentIndex}-${side}`,
    data: { segmentIndex, side },
  });

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const dragHandleWidth = position?.width || 0;

  return (
    <div
      ref={setNodeRef}
      key={`${segmentIndex}-${side}`}
      {...listeners}
      {...attributes}
      onFocus={onFocus}
      onBlur={onBlur}
      {...(side === 'left'
        ? {
            tabIndex: -1,
          }
        : {})}
      // className={cn(
      //   "absolute z-10",
      //   "focus:outline-none cursor-col-resize"
      //   // "bg-black/20 border border-black/50"
      // )}
      className={css`
        position: absolute;
        z-index: 10;
        cursor: col-resize;
      `}
      // Set the position to be the same as the word it's attached to
      style={
        position
          ? {
              top: position.top - 1,
              left:
                side === 'left'
                  ? position.left - 1
                  : position.left + position.width - dragHandleWidth,
              height: position.height,
              width: dragHandleWidth,
            }
          : {}
      }
    >
      {side === 'right' && (
        <div
          // className="absolute inset-y-0 right-[-0.1em] translate-x-1/2 w-0 flex justify-center items-center"
          className={css`
            position: absolute;
            top: 0;
            bottom: 0;
            height: 100%;
            right: -0.1em;
            transform: translateX(50%);
            width: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          `}
        >
          {dragHandleComponent && (isFocused || isHovered)
            ? dragHandleComponent
            : dragIndicatorComponent}
        </div>
      )}
    </div>
  );
};

const DragHandler = () => {
  const { segmentsWithIndexes, currentDragHandle } =
    useContext(TextEditorContext);

  return (
    <div
      // className="absolute inset-0"
      className={css`
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      `}
    >
      {currentDragHandle === null ? (
        segmentsWithIndexes.map(({ id }, index) => (
          <DragHandles key={`drag-handles-${id}`} segmentIndex={index} />
        ))
      ) : (
        <KeepDragHandleInDOM />
      )}

      {createPortal(
        <DragOverlay modifiers={[snapCenterToCursor]}>
          {currentDragHandle !== null ? <DragOverlayCursor /> : null}
        </DragOverlay>,
        document.body
      )}
    </div>
  );
};

export default DragHandler;
