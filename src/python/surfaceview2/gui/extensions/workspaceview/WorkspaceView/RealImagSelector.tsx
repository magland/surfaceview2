import React, { FunctionComponent } from 'react';
import RadioChoices from './RadioChoices';

// function valuetext(value: number) {
//   return `Slice ${value}`;
// }

type Props = {
  realImagIndex: number
  onRealImagIndexChanged: (i: number) => void
}

const RealImagSelector: FunctionComponent<Props> = ({ realImagIndex, onRealImagIndexChanged }) => {
  const handleChange = ((c: string) => {
    if (!c) return
    onRealImagIndexChanged(parseInt(c))
  })
  return (
    <div>
      <RadioChoices
        label=""
        value={realImagIndex + ''}
        onSetValue={handleChange}
        options={[
          {
            label: 'real part',
            value: '0',
            disabled: false
          },
          {
            label: 'imag part',
            value: '1',
            disabled: false
          },
          {
            label: 'abs',
            value: '2',
            disabled: false
          }
        ]}
      />
    </div>
  );
}

export default RealImagSelector