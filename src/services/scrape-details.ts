import { CompanyTypes, ScraperOptions } from "israeli-bank-scrapers";

export const filePath = "./lastTransactionDate.json";

export const minutesToMS = (numMinutes: number) => {
  return (numMinutes * 60 * 1000);
}

export const options:ScraperOptions = {
  companyId: CompanyTypes.visaCal, 
  startDate: new Date(0),
  combineInstallments: false,
  showBrowser: false,
  defaultTimeout: minutesToMS(1),
  timeout: minutesToMS(1),
  args: ['--no-sandbox']
};