import ClearIcon from '@mui/icons-material/Clear';

import { Button, Stack, TextField, Tooltip } from '@mui/material';

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { useI18n } from '@src/utils';
import { KeyboardKeyCode, KeyboardKeyName } from '@src/utils/keyboard.utils';

import type { SelectProps } from '@mui/material';
import type { ForwardRefRenderFunction, PropsWithChildren } from 'react';

const ModifierKeyNames = Object.values(KeyboardKeyName).filter(k => k !== KeyboardKeyName.Backspace);
const ModifierKeyCodes = Object.values(KeyboardKeyCode).filter(k => k !== KeyboardKeyCode.Backspace);

export type SearchInputRef = {
  visible: boolean;
  focused: boolean;
  focus: () => Promise<void>;
  blur: () => Promise<void>;
  clear: () => void;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  inputRef: React.RefObject<HTMLInputElement>;
};

type SearchInputProps = PropsWithChildren<{
  containerRef: React.RefObject<HTMLDivElement>;
  containerGetter?: (ref: React.RefObject<HTMLDivElement>) => HTMLElement | null | undefined;

  filter: string;
  showFilter?: boolean;
  disabled?: boolean;
  focusOnChange?: boolean;

  selectProps?: SelectProps;

  onChangeFilter: React.Dispatch<React.SetStateAction<string>>;
  onChangeVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectOpen?: React.Dispatch<React.SetStateAction<boolean>>;

  sx?: React.CSSProperties;
}>;
const _SearchInput: ForwardRefRenderFunction<SearchInputRef, SearchInputProps> = (
  {
    focusOnChange,
    containerRef,
    containerGetter,
    filter,
    showFilter,
    disabled,
    selectProps,
    onChangeFilter,
    onChangeVisible,
    onSelectOpen,
    sx,
    children,
  },
  ref,
) => {
  const i18n = useI18n('common', 'search-input');

  const filterRef = useRef<HTMLInputElement>(null);

  const [selectOpen, setSelectOpen] = useState(false);
  const [filterFocus, setFilterFocus] = useState<boolean>(false);

  const focusInput = async (input = filterRef.current?.querySelector('input')) => {
    if (!input) return;
    input.focus();
  };

  const blurInput = async (input = filterRef.current?.querySelector('input')) => {
    if (!input) return;
    input.blur();
  };

  const clear = async () => {
    onChangeFilter('');
    return blurInput();
  };

  const forceFocusVisible = () => {
    setFilterFocus(true);
    setTimeout(() => focusInput(), 200); // await animation time
  };

  const listener = async (e: KeyboardEvent) => {
    // if an input is focused, do not filter
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    // if any modifier keys are pressed without any other key, do not filter
    if (ModifierKeyNames.includes(e.key) || ModifierKeyCodes.includes(e.keyCode)) return;
    // if ctrl+v or cmd+v is pressed and clipboard is not empty, paste clipboard
    if ((e.ctrlKey || e.metaKey) && e.key === 'v' && navigator.clipboard) {
      const clip = await navigator.clipboard.readText();
      if (clip) onChangeFilter(_prev => `${_prev}${clip}`);
    }
    // if ctrl+f or cmd+f is pressed, focus the filter
    else if (!filter?.length && (e.ctrlKey || e.metaKey) && e.key === 'f') forceFocusVisible();
    // if backspace is pressed, remove last character
    else if (e.key === 'Backspace') onChangeFilter(_prev => _prev.slice(0, -1));
    else onChangeFilter(_prev => `${_prev}${e.key}`);
    if (focusOnChange && !filterFocus) await focusInput();
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    const container = containerGetter ? containerGetter(containerRef) : containerRef.current;
    if (disabled) {
      container?.removeEventListener('keydown', listener);
      onChangeFilter('');
    } else container?.addEventListener('keydown', listener);
    return () => container?.removeEventListener('keydown', listener);
  }, [containerRef, disabled]);

  const visible = useMemo(() => showFilter || filterFocus || selectOpen || (!disabled && !!filter), [showFilter, filterFocus, disabled, filter]);

  useEffect(() => {
    if (onChangeVisible) onChangeVisible(visible);
  }, [visible]);

  useEffect(() => {
    onSelectOpen?.(selectOpen);
  }, [selectOpen]);

  useImperativeHandle(ref, () => {
    return {
      get visible() {
        return filterRef.current?.dataset.visible === 'true';
      },
      get focused() {
        return filterRef.current?.dataset.focused === 'true';
      },
      setFilter: onChangeFilter,
      clear,
      blur: async () => blurInput(),
      focus: async () => (visible ? focusInput() : forceFocusVisible()),
      inputRef: filterRef,
    };
  });
  return (
    <Stack direction="row" sx={{ display: visible ? 'flex' : 'none', flex: '1 1 auto', alignItems: 'center', p: '0 0 0 0.25em', ...sx }}>
      {children && (
        <TextField
          select
          variant="standard"
          SelectProps={{
            MenuProps: { PaperProps: { sx: { left: '0 !important' } } },
            ...selectProps,
            onOpen: event => {
              setSelectOpen(true);
              selectProps?.onOpen?.(event);
            },
            onClose: event => {
              setSelectOpen(false);
              selectProps?.onClose?.(event);
              setTimeout(() => focusInput());
            },
          }}
          sx={{ minWidth: 'fit-content', mr: '0.5em' }}
        >
          {children}
        </TextField>
      )}
      <TextField
        ref={filterRef}
        placeholder={'Search'}
        variant="standard"
        data-visible={visible}
        data-focused={filterFocus}
        fullWidth={true}
        value={filter}
        disabled={disabled}
        onChange={e => onChangeFilter(e.target.value)}
        onFocus={() => setFilterFocus(true)}
        onBlur={() => setFilterFocus(false)}
      />
      <Tooltip arrow title={i18n('cancel', 'common', 'buttons')} PopperProps={{ disablePortal: true }}>
        <span>
          <Button
            key="cancel"
            color="error"
            sx={{ display: 'flex', flex: '1 1 auto', minWidth: '0', p: '0.5em', fontSize: '0.75em', mt: '0.5em' }}
            disabled={disabled || !filter}
            onClick={() => onChangeFilter('')}
          >
            <ClearIcon sx={{ width: '1em', fontSize: '1.25em' }} />
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
};

export const SearchInput = forwardRef(_SearchInput);
