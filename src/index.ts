import { CompanyTypes, ScraperCredentials, ScraperOptions, ScraperScrapingResult, createScraper } from 'israeli-bank-scrapers';
import axios from 'axios'
import { Transaction, TransactionsAccount } from 'israeli-bank-scrapers/lib/transactions';
import { getTimeInMS, } from './scrape-details';
import { getLastTransactionDate, updateLatestTransactionDate, } from './shared/lastTransactionState';
import { getCredentialsMap, serverUrl } from './environment';

const credentialsMap = getCredentialsMap();

const options:ScraperOptions = {
  companyId: CompanyTypes.visaCal, 
  startDate: new Date(0),
  combineInstallments: false,
  showBrowser: false,
};

const postTransactionToServer = async (transaction:Transaction, cardNumber:string):Promise<boolean> => {
  const data = {
      "TransNum": transaction.identifier,
      "Amount": transaction.originalAmount / (transaction.installments ? transaction.installments.total : 1),
      "Currency": transaction.chargedCurrency,
      "Description": transaction.description,
      "TransactionDate": transaction.date,
      "CardNumber": cardNumber,
  }
  try{
    await axios.post(serverUrl, data);
    // console.log("Inserted transaction " + transaction.identifier + " to database");
    return true;
  } catch (e){
    console.log("Failed to post transaction " + transaction.identifier);
    return false;
  }
};

const credentialsValid = (credentials:any):boolean => {
  for (const key in credentials) {
    if (credentials[key] === ''){
      return false;
    }
  }
  return true;
}

const scrapeAllProviders = async () => {
  // let latestTransaction = new Date(0);
  const companiesLastTransactions: Record<string, Promise<Date>> = {};

  for (const key in credentialsMap) {
    const companyId: CompanyTypes = key as CompanyTypes;
    const credentials = credentialsMap[companyId];
    if (credentials === undefined || !credentialsValid(credentials)) {
      console.log("Warning: missing credentials for " + companyId);
      continue;
    }
    const latestForCompany: Promise<Date> = scrapeProvider(companyId, credentials);
    companiesLastTransactions[key] = latestForCompany; 
  }

  for (const companyId in companiesLastTransactions) {
    const lastTransaction = await companiesLastTransactions[companyId];
    if (lastTransaction !== new Date(0) && lastTransaction) {
      updateLatestTransactionDate(companyId, lastTransaction);
    }
  }

};


const scrapeProvider = async (companyId:CompanyTypes, credentials:ScraperCredentials) => {
  options.startDate = getLastTransactionDate(companyId);
  try {
    options['companyId'] = companyId
    const scraper = createScraper(options);
    const scrapeResult = await scraper.scrape(credentials);

    if (!scrapeResult.success) {
      console.log(scrapeResult.errorType + " for company " + companyId);
      return new Date(0);
    }

    const latestForCompany = handleScrapeResult(scrapeResult);
    console.log("Done for " + companyId);
    return latestForCompany;
  } catch(e:any) {
    console.error(`scraping failed for company ${companyId} the following reason: ${e.message}`);
    return new Date(0)
  }
}

const handleScrapeResult = async (scrapeResult:ScraperScrapingResult) => {


  if (!scrapeResult.accounts) {
    console.log("No accounts were found for given credentials");
    return new Date(0);
  }

  let latestForCompany = new Date(0);
  await Promise.all(scrapeResult.accounts.map(async (account: TransactionsAccount) => {
    const transactions = account.txns;
    await Promise.all(transactions.map(async (transaction: Transaction) => {
      if (await postTransactionToServer(transaction, account.accountNumber)) {
        const transactionDate = new Date(transaction.date);
        latestForCompany = transactionDate > latestForCompany ? transactionDate : latestForCompany;
      }
    }));
  }));

  return latestForCompany;
}

setInterval(scrapeAllProviders, getTimeInMS(5));
scrapeAllProviders();
