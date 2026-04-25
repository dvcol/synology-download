import { cursorAnchorToPosition, elementToCursorAnchor, eventToCursorAnchor } from './quick-menu-position.utils';

describe('quick-menu-position.utils', () => {
  it('resolves document-based coordinates from pointer events with visual viewport offsets', () => {
    const mockWindow = {
      visualViewport: {
        pageLeft: 120,
        pageTop: 75,
      },
      scrollX: 100,
      scrollY: 60,
    } as unknown as Window;

    const anchor = eventToCursorAnchor({ clientX: 10, clientY: 20 }, mockWindow);

    expect(anchor).toEqual({ docX: 130, docY: 95 });
  });

  it('always derives anchor from client coordinates to avoid page-coordinate zoom drift', () => {
    const mockWindow = {
      visualViewport: {
        pageLeft: 500,
        pageTop: 250,
      },
      scrollX: 999,
      scrollY: 999,
    } as unknown as Window;

    const anchor = eventToCursorAnchor({ clientX: 1, clientY: 1, pageX: 42, pageY: 24 }, mockWindow);

    expect(anchor).toEqual({ docX: 501, docY: 251 });
  });

  it('converts document anchor into viewport position and clamps overflow', () => {
    const mockWindow = {
      visualViewport: {
        pageLeft: 100,
        pageTop: 50,
        width: 300,
        height: 200,
      },
      scrollX: 90,
      scrollY: 45,
      innerWidth: 0,
      innerHeight: 0,
    } as unknown as Window;

    const position = cursorAnchorToPosition({ docX: 450, docY: 5 }, mockWindow);

    expect(position).toEqual({ left: 300, top: 0 });
  });

  it('falls back to element rect when event is unavailable', () => {
    const anchor = {
      getBoundingClientRect: () => ({ left: 40, top: 80, width: 100, height: 60 }),
    } as unknown as Element;

    const mockWindow = {
      visualViewport: {
        pageLeft: 10,
        pageTop: 20,
      },
      scrollX: 0,
      scrollY: 0,
    } as unknown as Window;

    const cursorAnchor = elementToCursorAnchor(anchor, mockWindow);

    expect(cursorAnchor).toEqual({ docX: 60, docY: 110 });
  });
});
