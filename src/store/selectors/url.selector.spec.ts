import { ConnectionType, Protocol } from '../../models/settings.model';
import { urlReducer } from './settings.selector';

const local = { type: ConnectionType.local, protocol: Protocol.https, port: 443 };

describe('urlReducer', () => {
  it.each([
    ['nas.example.com', 'https://nas.example.com/'],
    ['https://nas.example.com', 'https://nas.example.com/'],
    ['https://nas.example.com/', 'https://nas.example.com/'],
    ['nas.example.com/', 'https://nas.example.com/'],
    ['  nas.example.com  ', 'https://nas.example.com/'],
    ['HTTP://nas.example.com//', 'https://nas.example.com/'],
  ])('builds a clean url from path %j', (path, expected) => {
    expect.assertions(1);
    expect(urlReducer({ ...local, path })).toBe(expected);
  });

  it('keeps a non default port', () => {
    expect.assertions(1);
    expect(urlReducer({ ...local, path: 'https://nas.example.com', port: 5001 })).toBe('https://nas.example.com:5001/');
  });

  it('strips a pasted scheme for two factor connections', () => {
    expect.assertions(1);
    expect(urlReducer({ ...local, type: ConnectionType.twoFactor, path: 'https://nas.example.com/' })).toBe('https://nas.example.com/');
  });

  it('strips a pasted scheme for quick connect', () => {
    expect.assertions(1);
    expect(urlReducer({ type: ConnectionType.quickConnect, protocol: Protocol.https, path: 'https://my-nas' })).toBe('https://my-nas.quickconnect.to/');
  });

  it.each([
    ['https://nas.example.com', 'https://nas.example.com/'],
    ['https://nas.example.com/dsm', 'https://nas.example.com/dsm/'],
    ['https://nas.example.com/dsm/', 'https://nas.example.com/dsm/'],
    [' https://nas.example.com:8443 ', 'https://nas.example.com:8443/'],
  ])('ensures a trailing slash for custom path %j', (path, expected) => {
    expect.assertions(1);
    expect(urlReducer({ type: ConnectionType.custom, path })).toBe(expected);
  });

  it('returns an empty string when the path is missing', () => {
    expect.assertions(1);
    expect(urlReducer({ ...local, path: '   ' })).toBe('');
  });
});
