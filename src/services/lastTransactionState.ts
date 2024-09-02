import editJsonFile from "edit-json-file";
import fs from 'fs'

export const getLastTransactionDate = (companyId:string):Date => {
  const file = editJsonFile('./lastTransactions.json');
  const data = file.get();
  if (undefined === data[companyId]) {
    file.set(companyId, 0);
    file.save();
    return new Date(0);
  }
  const date = new Date(data[companyId])
  date.setSeconds(date.getSeconds() + 10);
  return date;
}

export const initLastTransactionState = () => {
  if (fs.existsSync('./lastTransactions.json')) {
  }
}

export const updateLatestTransactionDate = (companyId:string, latestTransactionDate: Date) => {
  const file = editJsonFile('./lastTransactions.json');
  file.set(companyId, latestTransactionDate.getTime());
  file.save(); 
}