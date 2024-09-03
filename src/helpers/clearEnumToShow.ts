/**
 * Removes redundant enum keys with numeric values from the given enum object.
 * @param enumObject - The enum object to process.
 * @returns The updated enum object with only string values.
 */
export const clearEnumToShow = (enumObject: object) => {
  const enumKeys = Object.keys(enumObject);
  const lastKey = enumKeys[enumKeys.length - 1];
  if (typeof enumObject[lastKey] === 'string') return enumObject;

  const data = {};
  const keys = enumKeys.slice(enumKeys.length / 2);
  for (const key of keys) data[key] = enumObject[key];
  return data;
};
