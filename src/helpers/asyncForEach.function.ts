// @tslint
export async function asyncForEach(array, callback) {
  if (array) {
    for (let index = 0; index < array.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      await callback(array[index], index, array);
    }
  }
}
