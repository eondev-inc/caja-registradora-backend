// @tslint
export async function asyncForEach(array, callback) {
  if (array) {
    for (let index = 0; index < array.length; index += 1) {
      await callback(array[index], index, array);
    }
  }
}
