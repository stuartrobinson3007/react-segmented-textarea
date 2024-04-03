import { WordPositions } from './types';

const calculateWordPositions = (segments: {
  [id: string]: {
    el: HTMLSpanElement;
    relativeWordIndex: number;
  }[];
}): WordPositions | null => {
  const wordPositions = {} as WordPositions;

  Object.entries(segments).forEach(([id, words]) => {
    // loop through each word in the segment
    for (const word of words) {
      const { el } = word;

      if (!el) {
        return null;
      }

      if (!el.firstChild) {
        return null;
      }
      if (!el.lastChild) {
        return null;
      }

      const parentRect =
        el?.parentElement?.parentElement?.getBoundingClientRect();

      if (!parentRect) return;

      const startRange = document.createRange();
      const endRange = document.createRange();

      startRange.setStart(el.firstChild, 0);
      startRange.setEnd(el.firstChild, 1);

      const startRect = startRange.getBoundingClientRect();

      if (!el.lastChild?.textContent) return;

      const lastLetterIndex = el.lastChild.textContent.length - 1;
      endRange.setStart(el.lastChild, lastLetterIndex);
      endRange.setEnd(el.lastChild, lastLetterIndex + 1);

      const endRect = endRange.getBoundingClientRect();

      let width = startRect.height;

      // If the start and end are on the same line and it's a short segment (e.g. a single letter), then we set the width to half the width of the segment

      if (startRect.top === endRect.top) {
        const segmentWidth = endRect.left + endRect.width - startRect.left;
        width = Math.min(segmentWidth / 2, width);
      }

      if (!wordPositions[id]) {
        wordPositions[id] = [];
      }

      wordPositions[id] = [
        ...wordPositions[id],

        {
          left: {
            top: startRect.top - parentRect.top,
            left: startRect.left - parentRect.left,
            height: startRect.height,
            width,
          },
          right: {
            top: endRect.top - parentRect.top,
            left: endRect.left - parentRect.left + endRect.width - width,
            height: endRect.height,
            width,
          },
        },
      ];

      startRange.detach();
      endRange.detach();
    }
  });

  return wordPositions;
};

export default calculateWordPositions;
