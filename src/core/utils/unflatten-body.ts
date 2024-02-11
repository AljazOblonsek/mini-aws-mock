// TODO: Refactor this whole file - unit tests are already in place.

const KEYS_THAT_CAN_BE_TURNED_IN_ARRAY = ['member', 'entry'];

const convertListElementsToArray = (nestedBody: any): Record<string, unknown> => {
  const nestedBodyCopy = { ...nestedBody };

  for (const key in nestedBodyCopy) {
    if (typeof nestedBodyCopy[key] === 'object') {
      if (KEYS_THAT_CAN_BE_TURNED_IN_ARRAY.includes(key)) {
        const newArray = [];

        for (const index in nestedBodyCopy[key]) {
          // Directly apply recursion to each object element
          if (typeof nestedBodyCopy[key][index] === 'object') {
            newArray[Number(index) - 1] = convertListElementsToArray(nestedBodyCopy[key][index]);
          } else {
            newArray[Number(index) - 1] = nestedBodyCopy[key][index];
          }
        }

        return newArray as any;
      } else {
        nestedBodyCopy[key] = convertListElementsToArray(nestedBodyCopy[key]);
      }
    }
  }

  return nestedBodyCopy;
};

export const unflattenBody = (flatBody: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const key in flatBody) {
    let parts = key.split('.');
    let last = parts.pop();
    let current = result;

    parts.forEach((part) => {
      if (!current[part]) {
        current[part] = {};
      }

      current = current[part] as any;
    });

    current[last as string] = flatBody[key];
  }

  return convertListElementsToArray(result);
};
