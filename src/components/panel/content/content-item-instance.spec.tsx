/* eslint-disable ts/no-unsafe-assignment */

import { renderWithProviders } from '../../../test/render-helper';
import { ContentItemInstance } from './content-item-instance';

const mockContent = {
  item: { id: 'test-1', type: 'task', title: 'test' } as any,
  accordion: { expanded: false, hover: false } as any,
  hideStatus: false,
  setTaskEdit: () => {},
  setConfirmation: () => {},
  index: 0,
};

describe('content-item-instance', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ContentItemInstance content={mockContent} in={false} />,
    );
    expect(container).toBeTruthy();
  });
});
