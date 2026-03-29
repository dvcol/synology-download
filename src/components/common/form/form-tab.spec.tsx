/* eslint-disable ts/no-unsafe-assignment */
import { useForm } from 'react-hook-form';

import { renderWithProviders } from '../../../test/render-helper';
import { FormTab } from './form-tab';

const mockTab = {
  id: '1',
  title: 'Test Tab',
  enabled: true,
  type: 'download',
  icon: 'download',
} as any;

function TestFormTab() {
  const { control, getValues, setValue } = useForm({ defaultValues: { id: '1', title: 'Test Tab', enabled: true, type: 'download', icon: 'download' } });
  return <FormTab useFormProps={{ control, getValues, setValue }} tab={mockTab} />;
}

describe('form-tab', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TestFormTab />);
    expect(container).toBeTruthy();
  });
});
