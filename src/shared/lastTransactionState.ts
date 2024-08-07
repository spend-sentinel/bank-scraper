const editJsonFile = require("edit-json-file");

export const getLastTransactionDate = (companyId:string):Date => {
  const file = editJsonFile('./lastTransactions.json');
  const data = file.data;
  if (undefined === data[companyId]) {
    file.set(companyId, 0);
    file.save();
    return new Date(0);
  }
  return new Date(data[companyId]);
}
  
export const updateLatestTransactionDate = (companyId:string, latestTransactionDate: Date) => {
  const file = editJsonFile('./lastTransactions.json');
  file.set(companyId, latestTransactionDate.getTime());
  file.save();
}