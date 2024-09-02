import env from "env-var";
import { CompanyTypes, ScraperCredentials } from "israeli-bank-scrapers";


export const transactionApiUrl = env.get("TRANSACTION_API_URL").required().asString();
export const scrapeInterval = env.get("SCRAPE_INTERVAL").asInt() ?? 1;

export const initCredentialsMap = ():Partial<Record<CompanyTypes, ScraperCredentials>> => {
    const credentialsMap: Partial<Record<CompanyTypes, ScraperCredentials>> = {};

    credentialsMap[CompanyTypes.max] = {
        username: getCredentialsVariable("MAX_USERNAME"),
        password: getCredentialsVariable("MAX_PASSWORD")
    };

    credentialsMap[CompanyTypes.visaCal] = {
        username: getCredentialsVariable("VISACAL_USERNAME"),
        password: getCredentialsVariable("VISACAL_PASSWORD")
    };

    credentialsMap[CompanyTypes.isracard] = {
        id: getCredentialsVariable("ISRACARD_ID"),
        card6Digits: getCredentialsVariable("ISRACARD_6DIGITS"),
        password: getCredentialsVariable("ISRACARD_PASSWORD")
    };

    credentialsMap[CompanyTypes.amex] = {
        username: getCredentialsVariable('AMEX_USERNAME'),
        card6Digits:getCredentialsVariable("AMEX_6CARD_DIGITS"),
        password: getCredentialsVariable("AMEX_PASSWORD")
    };

    return credentialsMap
}

const getCredentialsVariable = (varName:string): CompanyTypes => {
    return env.get(varName).asString() as CompanyTypes;
}