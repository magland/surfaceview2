import React, { FunctionComponent } from 'react';
import RadioChoices from './RadioChoices';

// function valuetext(value: number) {
//   return `Slice ${value}`;
// }

type Props = {
  plane: 'XY' | 'XZ' | 'YZ'
  onPlaneChanged: (p: 'XY' | 'XZ' | 'YZ') => void
}

const PlaneSelector: FunctionComponent<Props> = ({ plane, onPlaneChanged }) => {
  return (
    <div>
      <RadioChoices
        label=""
        value={plane || 'XY'}
        onSetValue={(x) => onPlaneChanged(x as 'XY' | 'XZ' | 'YZ')}
        options={
          ['XY', 'XZ', 'YZ'].map(p => ({
            label: p,
            value: p,
            disabled: false
          }))
        }
      />
    </div>
  );
}

export default PlaneSelector