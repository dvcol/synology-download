import type { StylisElement } from '@emotion/cache';

import { describe, expect, it } from 'vitest';

import { fixNestedAmpersand } from './emotion.utils';

function makeElement(overrides: Partial<StylisElement> = {}): StylisElement {
  return {
    type: 'rule',
    value: '',
    props: [],
    root: null,
    parent: null,
    children: [],
    line: 1,
    column: 1,
    length: 1,
    return: '',
    ...overrides,
  };
}

describe('fixNestedAmpersand', () => {
  it('replaces &\\f in element props with the parent selector', () => {
    const parent = makeElement({ type: 'rule', props: ['.parent-class'] });
    const element = makeElement({
      parent,
      props: ['.parent-class .MuiTypography-root:where(&\f .MuiCardHeader-title)'],
    });

    fixNestedAmpersand(element, 0, [], () => {});

    expect(element.props[0]).toBe(
      '.parent-class .MuiTypography-root:where(.parent-class .MuiCardHeader-title)',
    );
  });

  it('replaces multiple &\\f occurrences in comma-separated selectors', () => {
    const parent = makeElement({ type: 'rule', props: ['.parent'] });
    const element = makeElement({
      parent,
      props: [
        '.parent .A:where(&\f .title)',
        '.parent .A:where(&\f .subtitle)',
      ],
    });

    fixNestedAmpersand(element, 0, [], () => {});

    expect(element.props[0]).toBe('.parent .A:where(.parent .title)');
    expect(element.props[1]).toBe('.parent .A:where(.parent .subtitle)');
  });

  it('does nothing when props have no &\\f markers', () => {
    const parent = makeElement({ type: 'rule', props: ['.parent'] });
    const element = makeElement({
      parent,
      props: ['.parent .child'],
    });

    fixNestedAmpersand(element, 0, [], () => {});

    expect(element.props[0]).toBe('.parent .child');
  });

  it('skips non-rule elements', () => {
    const element = makeElement({ type: 'decl', props: ['color'] });
    fixNestedAmpersand(element, 0, [], () => {});
    expect(element.props[0]).toBe('color');
  });

  it('skips elements without a rule-type parent', () => {
    const parent = makeElement({ type: '@media', parent: null });
    const element = makeElement({
      parent,
      props: ['.child:where(&\f .nested)'],
    });

    fixNestedAmpersand(element, 0, [], () => {});

    // Unchanged because no rule-type ancestor found
    expect(element.props[0]).toBe('.child:where(&\f .nested)');
  });

  it('walks up to the nearest rule-type ancestor', () => {
    const grandparent = makeElement({ type: 'rule', props: ['.root'] });
    const parent = makeElement({ type: '@media', parent: grandparent });
    const element = makeElement({
      parent,
      props: ['.root .item:where(&\f .label)'],
    });

    fixNestedAmpersand(element, 0, [], () => {});

    expect(element.props[0]).toBe('.root .item:where(.root .label)');
  });
});
