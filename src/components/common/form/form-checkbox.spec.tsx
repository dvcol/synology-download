import { useForm } from 'react-hook-form';

import { renderWithProviders } from '../../../test/render-helper';
import { FormCheckbox } from './form-checkbox';

function TestFormCheckbox() {
  const { control } = useForm({ defaultValues: { test: false } });
  return <FormCheckbox controllerProps={{ name: 'test', control }} />;
}

describe('form-checkbox', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TestFormCheckbox />);
    expect(container).toBeTruthy();
  });
});
