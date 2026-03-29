import { render } from '@testing-library/react';

import { AppInstance } from '../models/app-instance.model';
import { store } from '../store/store';
import { App } from './App';

describe('app', () => {
  it('renders without crashing', () => {
    const { container } = render(<App store={store} instance={AppInstance.popup} />);
    expect(container).toBeTruthy();
  });
});
