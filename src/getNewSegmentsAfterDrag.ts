import { SegmentWithIndexes } from './types';

const getNewSegmentsAfterDrag = ({
  segmentsWithIndexes,
  segmentIndex,
  wordIndex,
  wordSide,
  dragHandleSide,
}: {
  segmentsWithIndexes: SegmentWithIndexes[];
  segmentIndex: number;
  wordIndex: number;
  wordSide: 'left' | 'right';
  dragHandleSide: 'left' | 'right';
}) => {
  const fullText = segmentsWithIndexes.map(({ text }) => text).join(' ');

  const newSegmentsIndexes = [] as {
    id: string;
    startWordIndex: number;
    endWordIndex: number;
  }[];

  const prevSegmentIndexes = segmentsWithIndexes.map(
    ({ id, startWordIndex, endWordIndex }) => ({
      id,
      startWordIndex,
      endWordIndex,
    })
  );

  if (wordSide === 'right') {
    wordIndex++;
  }

  let currentSegment = prevSegmentIndexes[segmentIndex];

  const maxSettableWordIndex = fullText.split(' ').length;

  const clippedWordIndex = Math.min(wordIndex, maxSettableWordIndex);

  ////////////////////////////////////////////////////////////////////////////////////

  // This is a hack to make it so the drag handle can actually be dragged past the end of the segment
  // It's an addon to the logic below

  if (dragHandleSide === 'left' && wordIndex > currentSegment.startWordIndex) {
    // Make it so it's actually moving the right drag handle of the next segment
    dragHandleSide = 'right';
    segmentIndex--;
  } else if (
    dragHandleSide === 'right' &&
    wordIndex < currentSegment.endWordIndex
  ) {
    // Make it so it's actually moving the left drag handle of the previous segment
    dragHandleSide = 'left';
    segmentIndex++;
  }

  ////////////////////////////////////////////////////////////////////////////////////

  const isDraggingLeft = dragHandleSide === 'left';

  currentSegment = prevSegmentIndexes[segmentIndex];

  const otherSegments = prevSegmentIndexes.filter(
    ({ id }) => id !== currentSegment.id
  );

  // If the drag handle being dragged is from the left side of the segment
  if (dragHandleSide === 'left') {
    // Clip the wordIndex to the end of the current segment so the user can't drag the drag handle past the end of the segment
    // Note: This isn't actually used with the hack above because if the drag handle goes past the end, it's flipped
    wordIndex = Math.min(clippedWordIndex, currentSegment.endWordIndex + 1);

    // Find all segments to the left of the wordIndex that are not at all overlapped by the current segment
    const unaffectedSegments =
      wordIndex < currentSegment.startWordIndex
        ? // If the user is moving the drag handle further left
          otherSegments.filter(({ endWordIndex }) => endWordIndex < wordIndex)
        : // If the user is moving the drag handle right then it's the same thing but not the last segment
          otherSegments
            .filter(({ endWordIndex }) => endWordIndex < wordIndex)
            .slice(0, -1);

    // Push those segments to the new tempSegments as they are
    if (unaffectedSegments.length > 0) {
      newSegmentsIndexes.push(...unaffectedSegments);
    }

    // Find the segment after the last unaffected segment
    // If the start is the same as the wordIndex, we're exactly overlapping that segment so it should be ignored
    const affectedSegment = otherSegments.findLast(
      ({ startWordIndex, endWordIndex }) =>
        wordIndex < currentSegment.startWordIndex
          ? // If the user is moving the drag handle left
            startWordIndex < wordIndex && endWordIndex >= wordIndex
          : // If the user is moving the drag handle right
            startWordIndex < wordIndex
    );

    // If it's not exactly overlapped, add it to the new tempSegments with a new end index of wordIndex - 1
    if (affectedSegment) {
      if (affectedSegment.startWordIndex !== wordIndex) {
        // TODO This check might be able to be removed
        newSegmentsIndexes.push({
          ...affectedSegment,
          endWordIndex: wordIndex - 1,
        });
      }
    }

    // Push the current segment with the new start set to wordIndex and the existing end
    // Only do this if the current segment isn't getting deleted
    if (currentSegment.endWordIndex >= wordIndex) {
      const newCurrentSegment = {
        ...currentSegment,
        startWordIndex: wordIndex,
      };
      newSegmentsIndexes.push(newCurrentSegment);
    }

    // Find all segments after the current segment
    const segmentsAfter = otherSegments.filter(
      ({ startWordIndex, endWordIndex }) =>
        startWordIndex >= wordIndex &&
        endWordIndex > currentSegment.endWordIndex
    );

    // And add them to the new tempSegments
    if (segmentsAfter.length > 0) {
      newSegmentsIndexes.push(...segmentsAfter);
    }
  }

  // If the drag handle being dragged is from the right side of the segment
  if (dragHandleSide === 'right') {
    // Clip the wordIndex to the start of the current segment so the user can't drag the drag handle past the start of the segment
    // Note: This isn't actually used with the hack above because if the drag handle goes past the end, it's flipped
    wordIndex = Math.max(
      clippedWordIndex - 1,
      currentSegment.startWordIndex - 1
    );

    // Find all the segments to the left of the current segment
    const segmentsBefore = otherSegments.filter(
      ({ endWordIndex }) => endWordIndex < currentSegment.startWordIndex
    );

    // And add them to the new tempSegments
    if (segmentsBefore.length > 0) {
      newSegmentsIndexes.push(...segmentsBefore);
    }

    // Push the current segment with the new end set to wordIndex
    // Only do this if the current segment isn't getting deleted
    if (currentSegment.startWordIndex < clippedWordIndex) {
      const newCurrentSegment = {
        ...currentSegment,
        endWordIndex: wordIndex,
      };
      newSegmentsIndexes.push(newCurrentSegment);
    }

    // Find if there is a segment affected by the current segment
    const affectedSegment = otherSegments.find(
      ({ startWordIndex, endWordIndex }) =>
        wordIndex > currentSegment.endWordIndex
          ? // If the user is moving the drag handle right
            startWordIndex <= wordIndex && endWordIndex > wordIndex
          : // If the user is moving the drag handle left
            startWordIndex > wordIndex
    );

    if (affectedSegment) {
      // Push the affected segment with the new start
      // If we're deleting the current segment, the affected segment should be pushed with the same start
      newSegmentsIndexes.push({
        ...affectedSegment,
        startWordIndex:
          currentSegment.startWordIndex === wordIndex - 1
            ? wordIndex + 1
            : wordIndex + 1,
      });
    }

    // Find all the segments after the affected segment
    const segmentsAfter =
      wordIndex > currentSegment.endWordIndex
        ? // If the user is moving the drag handle right
          otherSegments.filter(
            ({ startWordIndex }) => startWordIndex > wordIndex
          )
        : // If the user is moving the drag handle left it's the same thing but not the first segment
          otherSegments
            .filter(({ startWordIndex }) => startWordIndex > wordIndex)
            .slice(1);

    // And add them to the new tempSegments
    if (segmentsAfter.length > 0) {
      newSegmentsIndexes.push(...segmentsAfter);
    }
  }

  // Create a string of new segments
  // const newSegmentsString = JSON.stringify(newSegmentIndexes);

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

  return {
    newSegments,
    isDraggingLeft,
  };
};

export default getNewSegmentsAfterDrag;
