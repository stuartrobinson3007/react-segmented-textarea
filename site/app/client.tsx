'use client';

import React from 'react';
import {
  ScissorsLineDashedIcon,
  TextCursorIcon,
  UnfoldHorizontalIcon,
} from 'lucide-react';

import { useTextEditor, TextEditor } from 'react-segmented-textarea';
import { segmentedSample } from './sampleText';

const initSegments = segmentedSample;

const borderColors = [
  'rgb(255 190 11 / 60%)',
  'rgb(2551 86 7 / 60%)',
  'rgb(131 56 236 / 60%)',
  'rgb(255 0 110 / 60%)',
  'rgb(35 209 189 / 60%)',
];

const backgroundColors = [
  'rgb(255 190 11 / 15%)',
  'rgb(2551 86 7 / 15%)',
  'rgb(131 56 236 / 15%)',
  'rgb(255 0 110 / 15%)',
  'rgb(35 209 189 / 15%)',
];

const textColors = [
  'rgb(55 0 0)',
  'rgb(55 0 0)',
  'rgb(0 0 36)',
  'rgb(55 0 0)',
  'rgb(0 9 0)',
];

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

const DragHandle = () => {
  return (
    <div
      className={cn(
        'border-blue-500/40 bg-blue-500 opacity-100',
        'rounded flex flex-col items-center justify-center space-y-0.5',
        'absolute',
        'w-[14px] top-0 h-auto bottom-[-2px] rounded'
      )}
    >
      <div className={cn('w-[3.5px] h-[3.5px] bg-white rounded-full')} />
      <div className={cn('w-[3.5px] h-[3.5px] bg-white rounded-full')} />
      <div className={cn('w-[3.5px] h-[3.5px] bg-white rounded-full')} />
    </div>
  );
};

function Client() {
  const textEditor = useTextEditor({
    defaultSegments: initSegments,
    defaultMode: 'edit',
    segmentStyle: {
      border: '1px solid',
      borderRadius: '3px',
    },
    segmentBorderColors: borderColors,
    segmentBackgroundColors: backgroundColors,
    segmentTextColors: textColors,
    dragHandleComponent: <DragHandle />,
    dragIndicatorComponent: (
      <div className="absolute bg-blue-500 rounded-full w-[9px] h-[9px]" />
    ),
    splitIndicatorComponent: (
      <div className={cn('absolute inset-y-0 w-2 bg-blue-500')} />
    ),
    dragOverlayCursor: (
      <div
        className={
          'absolute w-2 h-2 top-[0.5em] rounded-full border-blue-500 border-2 bg-white ring-4 ring-white'
        }
      />
    ),
  });

  const mode = textEditor.mode;

  return (
    <>
      <div className="mt-32 text-zinc-900 px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl text-center font-bold">
          React Segmented Textarea
        </h1>
        <p className="text-center mt-4 text-lg font-semibold text-zinc-500">
          A React textarea component which allows the user to partition the
          contents into segments with a draggable divider between each segment.
          Keyboard accessible.
        </p>
        <div className="mt-14 max-w-[600px] mx-auto p-6 border rounded bg-zinc-100">
          <p className="mb-6 text-center font-bold text-zinc-400 text-sm">
            Textarea
          </p>
          <TextEditor
            {...textEditor}
            className="h-[40vh] overflow-y-auto p-4 bg-white rounded text-2xl md:text-base"
          />
          <div className="flex justify-center mt-4 space-x-4">
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => {
                  textEditor.setMode('edit');
                }}
                className={`w-10 h-10 flex items-center justify-center bg-blue-400 text-blue-950 rounded-md cursor-pointer hover:bg-blue-300 transition duration-200 ease-in-out ${mode === 'edit' ? 'outline outline-3 outline-offset-2 outline-blue-400' : ''}`}
                aria-label="Edit mode"
              >
                <TextCursorIcon className="w-4 h-4" />
              </button>
              <p className="text-zinc-400 text-sm font-semibold">Type</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => {
                  textEditor.setMode('drag');
                }}
                className={`w-10 h-10 flex items-center justify-center bg-blue-400 text-blue-950 rounded-md cursor-pointer hover:bg-blue-300 transition duration-200 ease-in-out ${mode === 'drag' ? 'outline outline-3 outline-offset-2 outline-blue-400' : ''}`}
                aria-label="Drag mode"
              >
                <UnfoldHorizontalIcon className="w-5 h-5" />
              </button>
              <p className="text-zinc-400 text-sm font-semibold">Drag</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => {
                  textEditor.setMode('split');
                }}
                className={`w-10 h-10 flex items-center justify-center bg-blue-400 text-blue-950 rounded-md cursor-pointer hover:bg-blue-300 transition duration-200 ease-in-out ${mode === 'split' ? 'outline outline-3 outline-offset-2 outline-blue-400' : ''}`}
                aria-label="Split mode"
              >
                <ScissorsLineDashedIcon className="w-5 h-5" />
              </button>
              <p className="text-zinc-400 text-sm font-semibold">Split</p>
            </div>
          </div>
        </div>

        <div className="max-w-[600px] mx-auto mt-8 mb-16 p-16 pt-6 bg-zinc-100 border rounded text-wrap overflow-hidden">
          <p className="mb-8 text-center font-bold text-zinc-400 text-sm">
            Output
          </p>
          <pre className="text-wrap text-xs">
            <code>{JSON.stringify(textEditor.segments, null, 2)}</code>
          </pre>
        </div>
      </div>
    </>
  );
}

export default Client;
