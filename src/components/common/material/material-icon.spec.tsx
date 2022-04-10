import { render } from '@testing-library/react';
import React from 'react';

import { MaterialIcon } from '@src/models';

import { MuiIcon } from './material-icon';

import type { RenderResult } from '@testing-library/react';

describe('material-icon.tsx component', () => {
  Object.values(MaterialIcon).forEach(icon => {
    it(`Renders ${icon} icon`, () => {
      const view: RenderResult = render(<MuiIcon icon={icon} />);
      expect(view.asFragment()).toMatchSnapshot(icon);
    });
  });
});
