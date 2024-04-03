import { Segment, SegmentWithIndexes } from './types';

// To make segments easier to work with, we add the indexes of the start and end words of each segment in relation to the whole text
function addIndexesToSegments(segments: Segment[]): SegmentWithIndexes[] {
  let wordCount = 0;

  return segments.map((segment) => {
    const words = segment.text.split(' ');

    const start = wordCount;
    const end = wordCount + words.length - 1;

    wordCount += words.length;

    return {
      id: segment.id,
      text: segment.text,
      startWordIndex: start,
      endWordIndex: end,
    };
  });
}

export default addIndexesToSegments;
