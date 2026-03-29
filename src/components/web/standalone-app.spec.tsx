import { render } from '@testing-library/react';

import { AppInstance } from '../../models/app-instance.model';
import { store } from '../../store/store';
import { StandaloneApp } from './standalone-app';

describe('standalone-app', () => {
  it('renders without crashing', () => {
    const { container } = render(<StandaloneApp store={store} instance={AppInstance.standalone} />);
    expect(container).toBeTruthy();
  });
});
