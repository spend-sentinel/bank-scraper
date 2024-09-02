import axios from "axios";
import { Transaction } from "israeli-bank-scrapers/lib/transactions";
import { transactionApiUrl } from "./environment";

export const postTransactionToServer = async (transaction:Transaction, cardNumber:string):Promise<boolean> => {
    const data = {
        "TransNum": transaction.identifier ? transaction.identifier : transaction.date,
        "Amount": transaction.originalAmount / (transaction.installments ? transaction.installments.total : 1),
        "Currency": transaction.chargedCurrency,
        "Description": transaction.description,
        "TransactionDate": transaction.date,
        "CardNumber": cardNumber,
        "ReportedToBot": false,
    }
    try {
      await axios.post(transactionApiUrl, data);
      return true;
    } catch (e){
      console.log("Failed to post transaction " + transaction.identifier, e);
      return false;
    }
  };