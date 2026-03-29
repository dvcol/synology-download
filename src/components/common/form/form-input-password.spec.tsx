import { renderWithProviders } from '../../../test/render-helper';
import { FormInputPassword } from './form-input-password';

describe('form-input-password', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<FormInputPassword onToggle={() => {}} />);
    expect(container).toBeTruthy();
  });
});
