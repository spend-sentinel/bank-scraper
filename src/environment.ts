import env from "env-var";
import { CompanyTypes, ScraperCredentials } from "israeli-bank-scrapers";


export const serverUrl = env.get("serverUrl").required().asString();

export const getCredentialsMap = ():Partial<Record<CompanyTypes, ScraperCredentials>> => {
    const credentialsMap: Partial<Record<CompanyTypes, ScraperCredentials>> = {};
    credentialsMap[CompanyTypes.visaCal] = {
        username: getCredentialsVariable("visacalUsername"),
        password: getCredentialsVariable("visacalPassword")
    };

    credentialsMap[CompanyTypes.max] = {
        username: getCredentialsVariable("maxUsername"),
        password: getCredentialsVariable("maxPassword")
    };

    credentialsMap[CompanyTypes.isracard] = {
        id: getCredentialsVariable("isracardId"),
        card6Digits: getCredentialsVariable("isracard6digits"),
        password: getCredentialsVariable("isracardPassword")
    };

    credentialsMap[CompanyTypes.amex] = {
        username: getCredentialsVariable('amexUsername'),
        card6Digits:getCredentialsVariable("amexCard6Digits"),
        password: getCredentialsVariable("amexPassword")
    };

    return credentialsMap
}

const getCredentialsVariable = (name:string): string => {
    const value = env.get(name).asString()
    if (undefined === value) {
        return "";
    }
    return value;
}