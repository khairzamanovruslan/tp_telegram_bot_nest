export const countOccurrences = (str: string, char: string) => {
  console.log('str.length', str.length);
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) === char) {
      count = count + 1;
    }
  }
  return count;
};
