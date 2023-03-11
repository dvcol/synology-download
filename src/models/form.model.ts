import type { UseControllerProps } from 'react-hook-form/dist/types/controller';

export type FormRules<T> = Partial<Record<keyof T, UseControllerProps['rules']>>;
