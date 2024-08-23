export const filePath = "./lastTransactionDate.json";

export const minutesToMS = (numMinutes: number) => {
  const secondsInMin = 60;
  const millisecondsInSec = 1000;
  return (numMinutes * secondsInMin * millisecondsInSec);
}
