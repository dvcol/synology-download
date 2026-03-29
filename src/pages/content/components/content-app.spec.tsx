import createCache from '@emotion/cache';
import { render } from '@testing-library/react';

import { AppInstance } from '../../../models/app-instance.model';
import { store } from '../../../store/store';
import { ContentApp } from './content-app';

describe('content-app', () => {
  it('renders without crashing', () => {
    const cache = createCache({ key: 'test' });
    const container = document.createElement('div');
    const { container: rendered } = render(
      <ContentApp storeOrProxy={store} cache={cache} container={container} instance={AppInstance.content} />,
    );
    expect(rendered).toBeTruthy();
  });
});
