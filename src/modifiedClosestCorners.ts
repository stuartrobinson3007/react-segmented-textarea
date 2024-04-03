import { Coordinates } from '@dnd-kit/core/dist/types/coordinates';
import {
  CollisionDescriptor,
  CollisionDetection,
  ClientRect,
} from '@dnd-kit/core';

function cornersOfRectangle({ left, top, height, width }: ClientRect) {
  return [
    {
      x: left,
      y: top,
    },
    {
      x: left + width,
      y: top,
    },
    {
      x: left,
      y: top + height,
    },
    {
      x: left + width,
      y: top + height,
    },
  ];
}

function sortCollisionsAsc(
  { data: { value: a } }: CollisionDescriptor,
  { data: { value: b } }: CollisionDescriptor
) {
  return a - b;
}

function modifiedDstanceBetween(
  p1: Coordinates,
  p2: Coordinates,
  sensitivity = 10
) {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y) * sensitivity;
}

/**
 * Returns the closest rectangles from an array of rectangles to the corners of
 * another rectangle.
 */

/**
 * Modified to be more sensitive to distances in the x axis than the y axis.
 */

const sensitivity = 10;

export const modifiedClosestCorners: CollisionDetection = ({
  collisionRect,
  droppableRects,
  droppableContainers,
}) => {
  const corners = cornersOfRectangle(collisionRect);
  const collisions: CollisionDescriptor[] = [];

  for (const droppableContainer of droppableContainers) {
    const { id } = droppableContainer;
    const rect = droppableRects.get(id);

    if (rect) {
      const rectCorners = cornersOfRectangle(rect);
      const distances = corners.reduce((accumulator, corner, index) => {
        return (
          accumulator +
          modifiedDstanceBetween(rectCorners[index], corner, sensitivity)
        );
      }, 0);

      const effectiveDistance = Number((distances / 4).toFixed(4));

      collisions.push({
        id,
        data: { droppableContainer, value: effectiveDistance },
      });
    }
  }

  return collisions.sort(sortCollisionsAsc);
};
