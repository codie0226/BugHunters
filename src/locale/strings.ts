import { ko, type StringId } from './ko';

/** Returns the Korean string for the given id. Throws in dev if the id is missing. */
export function t(id: StringId): string {
  const val = ko[id];
  if (import.meta.env.DEV && val === undefined) {
    throw new Error(`Missing locale string: "${id}"`);
  }
  return val;
}
