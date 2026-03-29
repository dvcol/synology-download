import { renderWithProviders } from '../../../test/render-helper';
import { FormInputFile } from './form-input-file';

describe('form-input-file', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<FormInputFile onChange={() => {}} />);
    expect(container).toBeTruthy();
  });
});
