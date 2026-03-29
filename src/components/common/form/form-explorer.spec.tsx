import { useForm } from 'react-hook-form';

import { renderWithProviders } from '../../../test/render-helper';
import { FormExplorer } from './form-explorer';

function TestFormExplorer() {
  const { control } = useForm({ defaultValues: { test: '' } });
  return <FormExplorer controllerProps={{ name: 'test', control }} />;
}

describe('form-explorer', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TestFormExplorer />);
    expect(container).toBeTruthy();
  });
});
