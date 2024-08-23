import { startScheduler } from "./services/scheduler";


const main = async () => {
  try {
    console.log("Starting scraping process...");
    await startScheduler()
  } catch (e) {
    console.error("Error caught in global handler:", e);
  }
}

main();
