import { useDndContext } from '@dnd-kit/core';
import React, { useContext } from 'react';

import { TextEditorContext } from './TextEditor';

const DragOverlayCursor = () => {
  const { activatorEvent } = useDndContext();

  const { dragOverlayCursor } = useContext(TextEditorContext);

  // Check if the activatorEvent is KeyboardEvent
  if (!activatorEvent || !(activatorEvent instanceof KeyboardEvent)) {
    return null;
  }

  return dragOverlayCursor;
};

export default DragOverlayCursor;
