import { ScraperCredentials } from "israeli-bank-scrapers";
import { initCredentialsMap } from "./environment";

export const credentialsMap = initCredentialsMap();

export const credentialsValid = (credentials:ScraperCredentials):boolean => {
  if (!credentials) return false;
  for (const key of Object.keys(credentials) as (keyof ScraperCredentials)[]) {
    if (!credentials[key]){
      return false;
    }
  }
  return true;
}