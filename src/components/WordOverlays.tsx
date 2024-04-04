import React, { Fragment, useContext, useEffect, useState } from 'react';
import { TextEditorContext } from './TextEditor';
import { css } from 'goober';
import { useDroppable } from '@dnd-kit/core';
import { SegmentWithIndexes, WordPosition } from '../types';

type WordOverlayProps = {
  wordIndex: number;
  segmentIndex: number;
  segment: [number, number];
  side: 'left' | 'right';
  position: WordPosition;
};

const WordOverlay = ({
  wordIndex,
  segmentIndex,
  segment,
  side,
  position,
}: WordOverlayProps) => {
  const { mode, dragHandleComponent, splitIndicatorComponent, splitSegment } =
    useContext(TextEditorContext);

  const { setNodeRef, node, isOver } = useDroppable({
    id: `word-overlay-${wordIndex}-${segment[0]}-${segment[1]}-${side}`,
    data: { wordIndex, side, segmentIndex, segment },
  });

  const onClick = () => {
    let index = wordIndex;

    side === 'right' && index++;

    mode === 'split' && splitSegment(index);
  };

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const nodeCurrent = node?.current;

    nodeCurrent?.addEventListener('mouseenter', handleMouseEnter);
    nodeCurrent?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      nodeCurrent?.removeEventListener('mouseenter', handleMouseEnter);
      nodeCurrent?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [node]);

  return (
    <button
      className={css`
        position: absolute;
        outline: none;
        cursor: default;
        transform: ${side === 'left'
          ? 'translateX(-0.15em)'
          : 'translateX(0.15em)'};
      `}
      ref={setNodeRef}
      style={
        position
          ? {
              top: position.top - 1,
              left: position.left,
              height: position.height,
              width: position.width,
            }
          : {}
      }
      onClick={onClick}
      {...(side === 'left'
        ? {
            tabIndex: -1,
          }
        : {})}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {mode === 'drag' && isOver && (
        <div
          className={css`
            position: absolute;
            height: 100%;
            top: 0;
            bottom: 0;
            z-index: 10;
            width: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          `}
          style={{
            [side === 'left' ? 'left' : 'right']: 0,
          }}
        >
          {dragHandleComponent}
        </div>
      )}
      {mode === 'split' && (isHovered || isFocused) && (
        <div
          className={css`
            pointer-events: none;
            position: absolute;
            height: 100%;
            top: 0;
            bottom: 0;
            z-index: 10;
            width: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          `}
          style={{
            [side === 'left' ? 'left' : 'right']: 0,
          }}
        >
          {splitIndicatorComponent}
        </div>
      )}
    </button>
  );
};

const WordOverlays = () => {
  const { segmentsWithIndexes, wordPositions } = useContext(TextEditorContext);

  const words = segmentsWithIndexes
    .map(({ text }) => text)
    .join(' ')
    .split(' ');

  return (
    <div
      className={css`
        position: absolute;
        inset: 0;
      `}
    >
      {segmentsWithIndexes.map(({ id }, segmentIndex) => {
        const tempSegmentIndex = segmentsWithIndexes.findIndex(
          (segment) => segment.id === id
        );

        if (tempSegmentIndex === -1) {
          return null;
        }

        const tempSegment = segmentsWithIndexes[tempSegmentIndex];

        const { startWordIndex, endWordIndex } = tempSegment ?? {
          start: -1,
          end: -1,
        };

        return (
          <Fragment key={`segment-${id}`}>
            {tempSegment &&
              words
                .slice(startWordIndex, endWordIndex + 1)
                .map((word, index) => {
                  const wordIndex = index;

                  const rightPosition = wordPositions[id]?.[index]?.right;
                  const leftPosition = wordPositions[id]?.[index]?.left;

                  if (!rightPosition || !leftPosition) {
                    return null;
                  }

                  return (
                    <Fragment key={`${id}-word-${index}`}>
                      <WordOverlay
                        wordIndex={startWordIndex + wordIndex}
                        segmentIndex={segmentIndex}
                        segment={[startWordIndex, endWordIndex]}
                        side="left"
                        position={leftPosition}
                      />

                      <WordOverlay
                        wordIndex={startWordIndex + wordIndex}
                        segmentIndex={segmentIndex}
                        segment={[startWordIndex, endWordIndex]}
                        side="right"
                        position={rightPosition}
                      />
                    </Fragment>
                  );
                })}
          </Fragment>
        );
      })}
    </div>
  );
};

export default WordOverlays;
