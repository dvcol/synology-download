import { useForm } from 'react-hook-form';

import { renderWithProviders } from '../../../test/render-helper';
import { FormInput } from './form-input';

function TestFormInput() {
  const { control } = useForm({ defaultValues: { test: '' } });
  return <FormInput controllerProps={{ name: 'test', control }} />;
}

describe('form-input', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TestFormInput />);
    expect(container).toBeTruthy();
  });
});
