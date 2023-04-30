export function wait(number: number) {
  return new Promise((resolve) => setTimeout(resolve, number));
}
