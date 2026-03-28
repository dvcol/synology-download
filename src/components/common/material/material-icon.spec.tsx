import type { RenderResult } from '@testing-library/react';

import { render } from '@testing-library/react';
import React from 'react';

import { MaterialIcon } from '../../../models/material-ui.model';
import { MuiIcon } from './material-icon';

describe('material-icon.tsx component', () => {
  Object.values(MaterialIcon).forEach((icon) => {
    it('renders ', () => {
      const view: RenderResult = render(<MuiIcon icon={icon} />);
      expect(view.asFragment()).toMatchSnapshot(icon);
    });
  });
});
