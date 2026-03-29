import type { RenderOptions, RenderResult } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';

import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { store } from '../store/store';
import { lightTheme } from '../themes/themes';

// eslint-disable-next-line react-refresh/only-export-components -- test helper, not a component file
function TestProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: TestProviders, ...options });
}
