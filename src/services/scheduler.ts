import { minutesToMS } from "../scrape-details";
import { scrapeAllProviders } from "./scraper";
import { setTimeout } from "timers/promises";

export const startScheduler = async () => {
    let i = 1;
    while (true) {
        try {
            console.log("Scraping attempt #", i)
            await scrapeAllProviders();
            console.log("Attempt", i++, "Finished")
            await setTimeout(minutesToMS(5));
        } catch (e) {
            console.log("Scraping failed in time:", new Date(), "for following reason:", e);
        }
    }
}