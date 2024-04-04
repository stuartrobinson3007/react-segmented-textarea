<div align="center">
  <img alt="react-segmented-textarea" src="https://github.com/stuartrobinson3007/react-segmented-textarea/blob/main/assets/demo.gif?raw=true"/>
</div>

<br />

<div align="center">
  <img src="https://badgen.net/npm/v/react-segmented-textarea" alt="NPM Version" />
  <img src="https://badgen.net/bundlephobia/minzip/react-segmented-textarea" alt="minzipped size"/>
  <img src="https://github.com/stuartrobinson3007/react-segmented-textarea/workflows/CI/badge.svg" alt="Build Status" />
</a>
</div>
<br />
<div align="center"><strong>Textarea with adjustable segments for React</strong></div>
<div align="center">Customizable, accessible, and easy to use.</div>

<br />
<div align="center">
  <sub>By <a href="https://twitter.com/sturobinson">Stuart Robinson</a></sub>
</div>

<br />

## Demo

Check out a demo here: <a href="https://react-segmented-textarea.vercel.app/" target="_blank">Demo</a>

## Installation

#### With NPM

```sh
npm install react-segmented-textarea
```

<br />

## Getting Started

```jsx
import { TextEditor, textEditor } from 'react-segmented-textarea';


const App = () => {

const textEditor = useTextEditor()

  return (
    <TextEditor {...textEditor}>
  );
};
```

<br />

## Documentation

### Config Options

The `useTextEditor` hook provides functionality for managing the textarea config.

#### Defaults

- `defaultSegments`: An array of initial segments for the text editor. Default value is an empty array.
- `defaultMode`: The default mode of the text editor, either 'edit', 'drag' or 'split'. Default value is 'edit'.

### Styling

- `segmentStyle`: Custom CSS properties to style the text segments.

Colors defined below are provided as an array and looped over.

- `segmentBorderColors`: An array of colors for segment borders.
- `segmentBackgroundColors`: An array of colors for segment backgrounds.
- `segmentTextColors`: An array of colors for segment text.

- `dragIndicatorComponent`: Custom component for the drag indicator that appears at each segment intersection when in drag mode.
- `dragHandleComponent`: Custom component for the drag handle when a drag indicator is hovered over.
- `splitIndicatorComponent`: Custom component for the split indicator that appears when the user hovers over a word.
- `dragOverlayCursor`: Custom component for the drag overlay cursor that appears when the user is using the keyboard to adjust segments.
- `screenReaderInstructions`: Instructions for screen readers.

### Return Value

The hook returns these properties back so that they can be passed into the TextEditor component.
