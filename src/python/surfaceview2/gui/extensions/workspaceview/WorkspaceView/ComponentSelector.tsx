import React, { FunctionComponent } from 'react';
import RadioChoices from './RadioChoices';

// function valuetext(value: number) {
//   return `Slice ${value}`;
// }

type Props = {
  components: number[]
  currentComponent: number | undefined
  onCurrentComponentChanged: (c: number) => void
}

const ComponentSelector: FunctionComponent<Props> = ({ components, currentComponent, onCurrentComponentChanged }) => {
  const handleCurrentComponentChanged = ((c: string) => {
    if (!c) return
    onCurrentComponentChanged(parseInt(c))
  })
  return (
    <div>
      <RadioChoices
        label=""
        value={currentComponent + '' || ''}
        onSetValue={handleCurrentComponentChanged}
        options={
          components.map(c => ({
            label: c + '',
            value: c + '',
            disabled: false
          }))
        }
      />
    </div>
  );
}

export default ComponentSelector