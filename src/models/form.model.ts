import type { UseControllerProps } from 'react-hook-form';

export type FormRules<T> = Partial<Record<keyof T, UseControllerProps['rules']>>;
