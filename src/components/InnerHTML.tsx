import React from 'react';
import { Fragment } from 'react';
import ReactDOMServer from 'react-dom/server';
import { css } from 'goober';

import { SegmentWithIndexes, WordRefFnProps } from '../types';

type Props = {
  segmentsWithIndexes: SegmentWithIndexes[];
  segmentStyle: React.CSSProperties;
  colors: {
    segmentBackgroundColors: string[];
    segmentBorderColors: string[];
    segmentTextColors: string[];
  };
} & (
  | {
      mode: 'drag' | 'split';
      wordRefFn: (props: WordRefFnProps) => void;
      colorOffest?: number;
    }
  | {
      mode: 'edit';
    }
);

const InnerHTML = (props: Props) => {
  const { mode, segmentsWithIndexes, segmentStyle, colors } = props;

  const { segmentBackgroundColors, segmentBorderColors, segmentTextColors } =
    colors;

  const colorOffest = mode === 'drag' ? props.colorOffest || 0 : 0;

  const words = segmentsWithIndexes
    .map(({ text }) => text)
    .join(' ')
    .split(' ');

  return (
    <Fragment>
      {segmentsWithIndexes.map((segmentWithIndexes, segmentIndex) => {
        const { id, startWordIndex, endWordIndex } = segmentWithIndexes;

        return (
          <Fragment key={`segment-${id}`}>
            <span
              text-editor-span-type="segment"
              segment-id={id}
              // className="whitespace-pre-line text-wrap break-words"
              className={css`
                white-space: pre-line;
                word-wrap: break-word;
              `}
              style={{
                // boxDecorationBreak: "clone",
                // whiteSpace: "pre-line",
                // textWrap: "wrap",
                // marginRight: mode === "drag" ? "15px" : "0",
                ...segmentStyle,
                backgroundColor:
                  segmentBackgroundColors[
                    (segmentIndex + colorOffest) %
                      segmentBackgroundColors.length
                  ],
                borderColor: `${
                  segmentBorderColors[
                    (segmentIndex + colorOffest) % segmentBorderColors.length
                  ]
                }`,
                color: `${
                  segmentTextColors[
                    (segmentIndex + colorOffest) % segmentTextColors.length
                  ]
                }`,
              }}
            >
              {words
                .slice(startWordIndex, endWordIndex + 1)
                .map((word, index) => {
                  const wordIndex = startWordIndex + index;
                  return (
                    <Fragment key={`word-${index}`}>
                      <span
                        text-editor-span-type="word"
                        key={`${startWordIndex}-${endWordIndex}-${wordIndex}-${word}`}
                        // className="relative whitespace-pre-line text-wrap break-words"
                        // className={css`
                        //   white-space: pre-line;
                        // `}
                        className={css`
                          white-space: pre-line;
                          word-wrap: break-word;
                        `}
                        ref={
                          mode === 'drag' || mode === 'split'
                            ? (el) => {
                                props.wordRefFn({
                                  el,
                                  wordIndex,
                                });
                              }
                            : undefined
                        }
                      >
                        {word}
                      </span>
                      {index !== endWordIndex - startWordIndex ? (
                        <span
                          key={`word-${index}`}
                          text-editor-span-type="word-space"
                          // className="whitespace-pre-line text-wrap break-words"
                          // className={css`
                          //   white-space: pre-line;
                          // `}
                          // className={css`
                          //   white-space: pre-line;
                          // `}
                          className={css`
                            white-space: pre-line;
                            word-wrap: break-word;
                          `}
                          id={`${index}`}
                        >
                          {/* In edit mode, the special space character allows the user to type a space at the end of a segment. But in drag mode it causes wrapping issues on iOS */}
                          {mode === 'edit' ? '\u2005' : ' '}
                        </span>
                      ) : (
                        ''
                      )}
                    </Fragment>
                  );
                })}
            </span>
            {segmentIndex !== segmentsWithIndexes.length - 1 ? (
              <span text-editor-span-type="segment-space">
                {mode === 'edit' ? '\u2005' : ' '}
              </span>
            ) : (
              ''
            )}
          </Fragment>
        );
      })}
    </Fragment>
  );
};

const getHTMLString = async ({
  segmentsWithIndexes,
  segmentStyle,
  colors,
}: Props): Promise<string> => {
  return ReactDOMServer.renderToString(
    <InnerHTML
      mode="edit"
      segmentsWithIndexes={segmentsWithIndexes}
      segmentStyle={segmentStyle}
      colors={colors}
    />
  );
};

export { getHTMLString };

export default InnerHTML;
