import { downloadsSlice } from '../slices/downloads.slice';

// Action creators are generated for each case reducer function
const { setDownloads, spliceDownloads, setDownloadsCount, resetDownloads } = downloadsSlice.actions;

// Export as named constants
export { setDownloads, spliceDownloads, setDownloadsCount, resetDownloads };
