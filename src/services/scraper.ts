import { CompanyTypes } from "israeli-bank-scrapers/lib/definitions";
import { ScraperCredentials, ScraperOptions, ScraperScrapingResult } from "israeli-bank-scrapers/lib/scrapers/interface";
import { credentialsMap, credentialsValid } from "./credentials";
import { Transaction, TransactionsAccount } from "israeli-bank-scrapers/lib/transactions";
import { updateLatestTransactionDate, getLastTransactionDate } from "./lastTransactionState";
import { postTransactionToServer } from "./transactionApi";
import { createScraper } from "israeli-bank-scrapers";

const options:ScraperOptions = {
    companyId: CompanyTypes.visaCal, 
    startDate: new Date(0),
    combineInstallments: false,
    showBrowser: false,
    defaultTimeout: 5 * 60 * 1000,
    timeout: 5 * 60 * 1000,
    args: ['--no-sandbox']
  };

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
    options.startDate = getLastTransactionDate(companyId);
    options.companyId = companyId;
    try {
      const scraper = createScraper(options);
      console.log("Scraping", companyId, options.startDate, credentials);
      const scrapeResult = await scraper.scrape(credentials);
      if (!scrapeResult.success) {
        console.log("Scraping failed for following reason:", scrapeResult.errorType + ", for company " + companyId);
        return undefined;
      } else {
        console.log("Successfully scraped", companyId);
      }
  
      const latestForCompany = handleScrapeResult(scrapeResult);
      console.log("Done for " + companyId + "latest is " + await latestForCompany);
      return latestForCompany;
  
    } catch(e) {
      console.error(`scraping failed for company ${companyId} the following reason: ${e}`);
      return undefined;
    }
  }
  
  const noTransactionsFound = (scrapeResult:ScraperScrapingResult) => {
    let foundTransactions = false;
    scrapeResult.accounts?.forEach((account:TransactionsAccount) => {
      if (account.txns.length !== 0) {
        foundTransactions = true;
      }
    });
    if (!foundTransactions) return undefined;
  }

  const handleScrapeResult = async (scrapeResult:ScraperScrapingResult) => {
    if (!scrapeResult.accounts) {
      console.log("No accounts were found for given credentials");
      return undefined
    }

    if (noTransactionsFound(scrapeResult)) return undefined
    
    let latestForCompany = new Date(0);
    await Promise.all(scrapeResult.accounts.map(async (account: TransactionsAccount) => {
      const transactions = account.txns;
      console.log("found", transactions.length, "transactions");
      await Promise.all(transactions.map(async (transaction: Transaction) => {
        if (new Date(transaction.date) <= new Date()) {
          if (await postTransactionToServer(transaction, account.accountNumber)) {
            const transactionDate = new Date(transaction.date);
            latestForCompany = transactionDate > latestForCompany ? transactionDate : latestForCompany;
          }
        }
      }));
    }));

    console.log("Newest date is", latestForCompany);
    return latestForCompany;
  }