import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useTextEditor, TextEditor } from '../src/index';
import {
  backgroundColors,
  borderColors,
  segmentedSample,
  textColors,
} from './testConfig';

describe('Basic', () => {
  const TestComponent = () => {
    const textEditor = useTextEditor({
      defaultSegments: segmentedSample,
      defaultMode: 'edit',
      segmentStyle: {
        border: '1px solid',
        borderRadius: '3px',
      },
      segmentBorderColors: borderColors,
      segmentBackgroundColors: backgroundColors,
      segmentTextColors: textColors,
      dragHandleComponent: (
        <div
          style={{ width: '14px', height: '14px', backgroundColor: 'blue' }}
        ></div>
      ),
      dragIndicatorComponent: (
        <div
          style={{ width: '14px', height: '14px', backgroundColor: 'red' }}
        ></div>
      ),
      splitIndicatorComponent: (
        <div
          style={{ width: '14px', height: '14px', backgroundColor: 'green' }}
        ></div>
      ),
      dragOverlayCursor: (
        <div
          style={{ width: '14px', height: '14px', backgroundColor: 'purple' }}
        ></div>
      ),
    });

    return <TextEditor {...textEditor} />;
  };

  it('should render the component', async () => {
    const { container } = render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('When')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
