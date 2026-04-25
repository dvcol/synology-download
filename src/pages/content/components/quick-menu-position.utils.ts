import type { PopoverProps } from '@mui/material';

export interface CursorAnchor {
  docX: number;
  docY: number;
}

function getViewportState(targetWindow: Window = window) {
  const viewport = targetWindow.visualViewport;
  const left = viewport?.pageLeft ?? (viewport ? targetWindow.scrollX + viewport.offsetLeft : targetWindow.scrollX);
  const top = viewport?.pageTop ?? (viewport ? targetWindow.scrollY + viewport.offsetTop : targetWindow.scrollY);
  const width = viewport?.width ?? targetWindow.innerWidth;
  const height = viewport?.height ?? targetWindow.innerHeight;
  return {
    left,
    top,
    width: Math.max(width, 0),
    height: Math.max(height, 0),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.max(min, Math.min(value, max));
}

export function toCursorAnchor(clientX: number, clientY: number, targetWindow: Window = window): CursorAnchor {
  const viewport = getViewportState(targetWindow);
  return {
    docX: clientX + viewport.left,
    docY: clientY + viewport.top,
  };
}

export function eventToCursorAnchor(
  event: Pick<MouseEvent, 'clientX' | 'clientY'> & Partial<Pick<MouseEvent, 'pageX' | 'pageY'>>,
  targetWindow: Window = window,
): CursorAnchor {
  return toCursorAnchor(event.clientX, event.clientY, targetWindow);
}

export function elementToCursorAnchor(anchor?: Element | null, targetWindow: Window = window): CursorAnchor | undefined {
  if (!anchor) return undefined;
  const rect = anchor.getBoundingClientRect();
  const clientX = rect.left + Math.min(rect.width, 20) / 2;
  const clientY = rect.top + Math.min(rect.height, 20) / 2;
  return toCursorAnchor(clientX, clientY, targetWindow);
}

export function cursorAnchorToPosition(
  anchor: CursorAnchor,
  targetWindow: Window = window,
): NonNullable<PopoverProps['anchorPosition']> {
  const viewport = getViewportState(targetWindow);
  return {
    left: clamp(anchor.docX - viewport.left, 0, viewport.width),
    top: clamp(anchor.docY - viewport.top, 0, viewport.height),
  };
}
