import { memoize, Memoized } from './memoize-utils';

class Test {
  static add1(val: number) {
    console.debug('computing add1');
    return 1 + val;
  }

  @Memoized
  static add2(val: number) {
    console.debug('computing add2');
    return 2 + val;
  }

  static add3 = memoize((val: number) => {
    console.debug('computing add3');
    return 3 + val;
  });
}

describe('memoize-utils.ts', () => {
  const spy = jest.spyOn(console, 'debug');

  afterEach(() => jest.clearAllMocks());

  it('add1', () => {
    expect(Test.add1(0)).toBe(1);
    expect(Test.add1(0)).toBe(1);
    expect(Test.add1(1)).toBe(2);
    expect(Test.add1(0)).toBe(1);
    expect(Test.add1(1)).toBe(2);

    expect(spy).toBeCalledTimes(5);
  });

  it('add2', () => {
    expect(Test.add2(0)).toBe(2);
    expect(Test.add2(0)).toBe(2);
    expect(Test.add2(1)).toBe(3);
    expect(Test.add2(0)).toBe(2);
    expect(Test.add2(1)).toBe(3);

    expect(spy).toBeCalledTimes(2);
  });

  it('add3', () => {
    expect(Test.add3(0)).toBe(3);
    expect(Test.add3(0)).toBe(3);
    expect(Test.add3(1)).toBe(4);
    expect(Test.add3(0)).toBe(3);
    expect(Test.add3(1)).toBe(4);

    expect(spy).toBeCalledTimes(2);
  });
});
