import { CompanyTypes } from "israeli-bank-scrapers/lib/definitions";
import { ScraperCredentials, ScraperScrapingResult } from "israeli-bank-scrapers/lib/scrapers/interface";
import { credentialsMap, credentialsValid } from "./credentials";
import { Transaction, TransactionsAccount } from "israeli-bank-scrapers/lib/transactions";
import { updateLatestTransactionDate, getLastTransactionDate } from "./lastTransactionState";
import { postTransactionToServer } from "./transactionApi";
import { createScraper } from "israeli-bank-scrapers";
import { options } from "./scrape-details";


export const scrapeAllProviders = async () => {
    await Promise.all(Object.entries(credentialsMap)
    .filter(([companyId, credentials]) => {
      if (!credentialsValid(credentials)) {
        console.warn("Missing credentials for", companyId);
        return false;
      }
      return true;
    }).map(async ([companyId, credentials]) => {
        const latestForCompany = await scrapeProvider(companyId as CompanyTypes, credentials);
        if (latestForCompany !== undefined) updateLatestTransactionDate(companyId, latestForCompany);
    }));

  };
  
  const scrapeProvider = async (companyId:CompanyTypes, credentials:ScraperCredentials) => {
    const companyOptions = {...options};
    companyOptions.startDate = getLastTransactionDate(companyId);
    companyOptions.companyId = companyId;
    try {
      const scraper = createScraper(companyOptions);
      console.log("Scraping", companyId, "from date", companyOptions.startDate);
      const scrapeResult = await scraper.scrape(credentials);
      if (!scrapeResult.success) {
        console.log("Scraping failed for following reason:", scrapeResult.errorType + ", for company " + companyId);
        return undefined;
      } else {
        console.log("Successfully scraped", companyId);
      }
      scrapeResult.accounts?.forEach((account) => {
        console.log(`found ${account.txns.length} transactions for account ${account.accountNumber}`)
      })
      const latestForCompany = handleScrapeResult(scrapeResult);
      console.log("Done for " + companyId + "latest is " + await latestForCompany);
      return latestForCompany;
  
    } catch(e) {
      console.error(`scraping failed for company ${companyId} the following reason: ${e}`);
      return undefined;
    }
  }
  
  const transactionsFound = (scrapeResult:ScraperScrapingResult) => {
    let foundTransactions = false;
    scrapeResult.accounts?.forEach((account:TransactionsAccount) => {
      account.txns = account.txns.filter((transaction) => new Date(transaction.date) < new Date()); // post only transactions that happened (not future expenses such as installments)
      if (account.txns.length !== 0) {
        foundTransactions = true;
      }
    });

    return foundTransactions;
  }

  const handleScrapeResult = async (scrapeResult:ScraperScrapingResult) => {
    if (!scrapeResult.accounts) {
      console.log("No accounts were found for given credentials");
      return undefined
    }

    if (!transactionsFound(scrapeResult)) return undefined
    
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

    console.log("Newest date is", latestForCompany);
    return latestForCompany == new Date(0) ? undefined : latestForCompany;
  }