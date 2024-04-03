import { SegmentWithIndexes } from './types';

function normalizeText(str: string): string {
  return (
    // Replace any type of space with a normal space, but replace newlines with nothing
    str && str.replace(/\s/g, ' ').replace(/\n/g, '')
  );
}

const makeSegmentObject = ({
  id,
  text,
  wordCounter,
}: {
  id: string;
  text: string;
  wordCounter: number;
}) => {
  return {
    id: id,
    text: text,
    startWordIndex: wordCounter - text.split(' ').length,
    endWordIndex: wordCounter - 1,
  };
};

const HMTLToSegments = (el: HTMLDivElement): SegmentWithIndexes[] => {
  //const segmentSpans = Array.from(el.childNodes);
  // get the segment spans and segment spaces using the data attribute
  const segmentSpans = Array.from(
    el.querySelectorAll(
      '[text-editor-span-type="segment"], [text-editor-span-type="segment-space"]'
    )
  );

  if (segmentSpans.length === 0) {
    if (!el.textContent) {
      return [];
    } else {
      // If the user deleted all the text to replace it with something else, we return that text as a new segment
      // Because the original segments have been deleted
      return [
        makeSegmentObject({
          id: Math.random().toString(36).substr(2, 9),
          text: normalizeText(el.textContent),
          wordCounter: 1,
        }),
      ];
    }
  }

  // loop through our segmentSpans
  // for every segment span that isn't a space, we add it to our current segment
  // for every space, we start a new segment

  let segments: SegmentWithIndexes[] = [];

  let currentText = '';
  let currentSegmentId = '';
  let wordCounter = 0;

  for (const segmentSpan of segmentSpans) {
    if (segmentSpan.getAttribute('text-editor-span-type') === 'segment') {
      currentSegmentId = segmentSpan.getAttribute('segment-id') || '';

      const wordSpans = Array.from(
        segmentSpan.querySelectorAll(
          '[text-editor-span-type="word"], [text-editor-span-type="word-space"]'
        )
      );

      for (const wordSpan of wordSpans) {
        const word = normalizeText(wordSpan.textContent || '');

        if (word) {
          currentText += word;
        }
      }
    } else {
      // We're at a segment space

      // If the text in the segment space is a simple space, this is a break between segments
      if (segmentSpan.textContent?.match(/^\s$/)) {
        // Push the current text to the array
        // If the text has been precisely selected and then deleted, it will be an empty string so we check for that here
        if (currentText.length > 0) {
          wordCounter += currentText.split(' ').length;
          segments.push(
            makeSegmentObject({
              id: currentSegmentId,
              text: currentText,
              wordCounter: wordCounter,
            })
          );
        }

        // And reset the current text
        currentText = '';
      } else if (segmentSpan.textContent?.charAt(0)?.match(/^\s$/)) {
        // If the text in the segment space starts with a space, this is a break between segments
        // But the user has added a space to the start of the next segment

        // So we push the current text to the array

        wordCounter += currentText.split(' ').length;

        segments.push(
          makeSegmentObject({
            id: currentSegmentId,
            text: currentText,
            wordCounter: wordCounter,
          })
        );

        // Reset the current text
        currentText = normalizeText(segmentSpan.textContent.slice(1));
      } else {
        const word = normalizeText(segmentSpan.textContent || '');

        if (word) {
          currentText += word;
        }
      }
    }
  }

  if (currentText.length > 0) {
    wordCounter += currentText.split(' ').length;

    segments.push(
      makeSegmentObject({
        id: currentSegmentId,
        text: currentText,
        wordCounter: wordCounter,
      })
    );
  }

  return segments;
};

export default HMTLToSegments;
