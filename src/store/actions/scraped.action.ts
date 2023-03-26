import { scrapedSlice } from '../slices/scraped.slice';

// Action creators are generated for each case reducer function
const { setScrapedContents, clearScrapedContents, setScrapedPage, clearScrapedPage } = scrapedSlice.actions;

// Export as named constants
export { setScrapedContents, clearScrapedContents, setScrapedPage, clearScrapedPage };
