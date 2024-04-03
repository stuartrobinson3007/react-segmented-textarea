const getCaretPosition = (
  contentEditableRef: React.RefObject<HTMLDivElement>
) => {
  if (!contentEditableRef.current) {
    return null;
  }

  const segment = window.getSelection();

  if (segment?.rangeCount) {
    const range = segment.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(contentEditableRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }
};

// To resore the drag handle position, we need to find the span where the drag handle position will be
// Then we find the exact offset in that span to set it there
const restoreCaretPosition = (
  contentEditableRef: React.RefObject<HTMLDivElement>,
  caretPosition: number
) => {
  if (contentEditableRef.current && caretPosition !== null) {
    // Create an array of all the spans that could contain the caret
    const spans = contentEditableRef.current.querySelectorAll(
      '[text-editor-span-type="word"], [text-editor-span-type="word-space"], [text-editor-span-type="segment-space"]'
    );

    let charCount = 0;
    let selectedSpan: HTMLSpanElement | null = null;

    const spansArray = Array.from(spans) as HTMLSpanElement[];

    // Loop through all the spans until the charCount is greater than the drag handle position
    // This means we've found the right span
    for (const span of spansArray) {
      const textContent = span.textContent || '';

      charCount += textContent.length;

      // If we find that span we reset the charCount to the start of the span
      if (charCount >= caretPosition) {
        selectedSpan = span;
        charCount -= span.textContent?.length || 0;

        // Stop looping
        break;
      }
    }

    // Now we've got the span, we find the offset in the span
    // And set the drag handle position there
    if (selectedSpan?.firstChild) {
      let offsetInSpan = caretPosition - charCount;

      const range = document.createRange();
      range.setStart(selectedSpan.firstChild, offsetInSpan);
      range.collapse(true);
      const segment = window.getSelection();
      segment?.removeAllRanges();
      segment?.addRange(range);
    }
  }
};

export { getCaretPosition, restoreCaretPosition };
