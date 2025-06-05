import { ComboboxValueType } from '../models/shared.model';

export const comboboxValueFormatter = (state: ComboboxValueType): string => {
  if (typeof state === 'string') {
    return state;
  }

  return state.value;
};
