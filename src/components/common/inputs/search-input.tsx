import ClearIcon from '@mui/icons-material/Clear';
import { Button, Stack, TextField, Tooltip } from '@mui/material';

import React, { useEffect, useMemo, useState } from 'react';

import { useI18n } from '@src/utils';
import { KeyboardKeyCode, KeyboardKeyName } from '@src/utils/keyboard.utils';

import type { FC } from 'react';

const ModifierKeyNames = Object.values(KeyboardKeyName).filter(k => k !== KeyboardKeyName.Backspace);
const ModifierKeyCodes = Object.values(KeyboardKeyCode).filter(k => k !== KeyboardKeyCode.Backspace);

type SearchInputProps = {
  containerRef: React.RefObject<HTMLDivElement>;
  containerGetter?: (ref: React.RefObject<HTMLDivElement>) => HTMLElement | null | undefined;
  filter: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  showFilter?: boolean;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
  sx?: React.CSSProperties;
};
export const SearchInput: FC<SearchInputProps> = ({ containerRef, containerGetter, filter, setFilter, showFilter, setVisible, disabled, sx }) => {
  const i18n = useI18n('common', 'search-input');

  const [filterRef, setFilterRef] = useState<HTMLDivElement | null>(null);
  const [filterFocus, setFilterFocus] = useState<boolean>(false);

  const listener = async (e: KeyboardEvent) => {
    // if an input is focused, do not filter
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    // if any modifier keys are pressed without any other key, do not filter
    if (ModifierKeyNames.includes(e.key) || ModifierKeyCodes.includes(e.keyCode)) return;
    // if ctrl+v or cmd+v is pressed and clipboard is not empty, paste clipboard
    if ((e.ctrlKey || e.metaKey) && e.key === 'v' && navigator.clipboard) {
      const clip = await navigator.clipboard.readText();
      if (clip) setFilter(_prev => `${_prev}${clip}`);
    }
    // if ctrl+f or cmd+f is pressed, focus the filter
    else if (!filter?.length && (e.ctrlKey || e.metaKey) && e.key === 'f') {
      const input = filterRef?.querySelector('input');
      if (input) input.focus();
    }
    // if backspace is pressed, remove last character
    else if (e.key === 'Backspace') setFilter(_prev => _prev.slice(0, -1));
    else setFilter(_prev => `${_prev}${e.key}`);
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    const container = containerGetter ? containerGetter(containerRef) : containerRef.current;
    if (disabled) {
      container?.removeEventListener('keydown', listener);
      setFilter('');
    } else container?.addEventListener('keydown', listener);
    return () => container?.removeEventListener('keydown', listener);
  }, [containerRef, disabled]);

  const visible = useMemo(() => showFilter || filterFocus || (!disabled && !!filter), [showFilter, filterFocus, disabled, filter]);

  useEffect(() => {
    if (setVisible) setVisible(visible);
  }, [visible]);

  return (
    <Stack direction="row" sx={{ display: visible ? 'flex' : 'none', flex: '1 1 auto', alignItems: 'center', p: '0 0.25em', ...sx }}>
      <TextField
        ref={setFilterRef}
        placeholder={'Search'}
        variant="standard"
        fullWidth={true}
        value={filter}
        disabled={disabled}
        onChange={e => setFilter(e.target.value)}
        onFocus={() => setFilterFocus(true)}
        onBlur={() => setFilterFocus(false)}
      />
      <Tooltip arrow title={i18n('cancel', 'common', 'buttons')} PopperProps={{ disablePortal: true }}>
        <span>
          <Button
            key="cancel"
            color="error"
            sx={{ display: 'flex', flex: '1 1 auto', minWidth: '0', p: '0.5em', fontSize: '0.75em' }}
            disabled={disabled || !filter}
            onClick={() => setFilter('')}
          >
            <ClearIcon fontSize="small" sx={{ width: '1em', fontSize: '1.125em' }} />
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
};
