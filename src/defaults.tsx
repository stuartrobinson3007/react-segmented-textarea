import { css, styled } from 'goober';

const defaultBorderColors = ['rgb(0 0 0 / 40%)'];

const defaultBackgroundColors = ['rgb(0 0 0 / 10%)'];

const defaultTextColors = ['rgb(0 0 0)'];

const defaultSegmentStyle: React.CSSProperties = {
  border: '1px solid',
  borderRadius: '3px',
};

const dotStyle = css`
  width: 3px;
  height: 3px;
  background-color: white;
  border-radius: 50%;
`;

const DefaultDragHandle = () => {
  return (
    <div
      className={css`
        border: 1px solid rgb(59 130 246 / 40%);
        background-color: rgb(59 130 246);
        opacity: 1;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.5px;
        position: absolute;
        width: 14px;
        top: 0;
        height: auto;
        bottom: -2px;
        border-radius: 3px;
      `}
    >
      <div className={dotStyle} />
      <div className={dotStyle} />
      <div className={dotStyle} />
    </div>
  );
};

const DefaultDragIndicator = () => {
  return (
    <div
      className={css`
        position: absolute;
        background-color: rgb(59 130 246);
        border-radius: 50%;
        width: 9px;
        height: 9px;
      `}
    />
  );
};

const DefaultSplitIndicator = () => {
  return (
    <div
      className={css`
        position: absolute;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: rgb(59 130 246);
      `}
    />
  );
};

const DefaultDragOverlayCursor = () => {
  return (
    <div
      className={css`
        position: absolute;
        width: 2px;
        height: 2px;
        top: 0.5em;
        border-radius: 50%;
        border: 2px solid rgb(59 130 246);
        background-color: white;
        box-shadow: 0 0 0 4px white;
      `}
    />
  );
};

export {
  defaultBorderColors,
  defaultBackgroundColors,
  defaultTextColors,
  defaultSegmentStyle,
  DefaultDragHandle,
  DefaultDragIndicator,
  DefaultSplitIndicator,
  DefaultDragOverlayCursor,
};
