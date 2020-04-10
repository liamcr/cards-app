export function shuffle(arr) {
  let currentIndex = arr.length;
  let tempVal, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    tempVal = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = tempVal;
  }

  return arr;
}
