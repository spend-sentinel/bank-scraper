import { ScraperCredentials } from "israeli-bank-scrapers";
import { getCredentialsMap } from "./environment";

export const credentialsMap = getCredentialsMap();

export const credentialsValid = (credentials:ScraperCredentials):boolean => {
  if (!credentials) return false;
  for (const key of Object.keys(credentials) as (keyof ScraperCredentials)[]) {
    if (!credentials[key]){
      return false;
    }
  }
  return true;
}