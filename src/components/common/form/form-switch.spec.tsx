import { useForm } from 'react-hook-form';

import { renderWithProviders } from '../../../test/render-helper';
import { FormSwitch } from './form-switch';

function TestFormSwitch() {
  const { control } = useForm({ defaultValues: { test: false } });
  return <FormSwitch controllerProps={{ name: 'test', control }} />;
}

describe('form-switch', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TestFormSwitch />);
    expect(container).toBeTruthy();
  });
});
