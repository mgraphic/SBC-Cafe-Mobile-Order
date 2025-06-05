export type KeyValuePair<T> = {
  key: string;
  value: T;
};

export type IdValuePair<T> = {
  id: string | number | symbol;
  value: T;
};

export type ComboboxValueType =
  | string
  | KeyValuePair<string>
  | IdValuePair<string>;
