import type { FetchInputs } from '@src/pages/web';

export const resolveUrl = (input: FetchInputs[0]): string | undefined => {
  let url: string | undefined;
  if (typeof input === 'string') url = input;
  else if (input instanceof URL) url = input.toString();
  else if (input instanceof Request) url = input.url;
  return url;
};

export type MockListener<T> = (mock: T) => void;
export class AbstractMock {
  protected listeners: MockListener<this>[] = [];

  protected publish() {
    this.listeners.forEach(cb => cb(this));
  }

  addListener(cb: MockListener<this>) {
    this.listeners.push(cb);
  }

  removeListener(cb: MockListener<this>) {
    this.listeners = this.listeners.filter(t => t !== cb);
  }
}
