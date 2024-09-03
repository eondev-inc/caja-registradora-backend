const isNotUndefined = (dataToCheck) => {
  if (!dataToCheck) {
    return false;
  }
  if (dataToCheck === 'undefined') {
    return false;
  }
  if (dataToCheck === undefined) {
    return false;
  }
  return true;
};

const isNotUndefinedAndBlank = (dataToCheck) => {
  if (!isNotUndefined(dataToCheck)) {
    return false;
  }
  if (dataToCheck === '') {
    return false;
  }
  return true;
};

export { isNotUndefined, isNotUndefinedAndBlank };
