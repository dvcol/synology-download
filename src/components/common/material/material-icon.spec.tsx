import React from 'react';

import { render, RenderResult } from '@testing-library/react';
import { MaterialIcon } from '@src/models';
import { MuiIcon } from './material-icon';

describe('material-icon.tsx component', () => {
  Object.values(MaterialIcon).forEach((icon) => {
    it(`Renders ${icon} icon`, () => {
      const app: RenderResult = render(<MuiIcon icon={icon} />);
      expect(app.asFragment()).toMatchSnapshot(icon);
    });
  });
});
