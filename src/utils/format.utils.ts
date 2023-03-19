import prettyBytes from 'pretty-bytes';

export const computeProgress = (downloaded: number | any, size: number | any): number => {
  const numDownloaded = Number(downloaded);
  const numSize = Number(size);
  if (numDownloaded && Number.isFinite(numDownloaded) && numSize && Number.isFinite(numSize)) {
    const progress = Math.floor((numDownloaded / numSize) * 100);
    return Number.isFinite(progress) ? progress : 0;
  }
  return 0;
};
export const formatTime = (s: number): string => {
  const hours = Math.floor(s / (60 * 60));
  const minutes = Math.floor(s / 60) - hours * 60;
  const seconds = Math.floor(s) - hours * 60 * 60 - minutes * 60;

  function withZero(n: number) {
    return n > 9 ? n.toString() : `0${n.toString()}`;
  }

  return `${hours ? `${hours}h ` : ''}${hours ? withZero(minutes) : minutes}m ${withZero(seconds)}s`;
};
export const formatBytes = (byte: number | any): string => {
  const num = Number(byte);
  if (num && Number.isFinite(num)) {
    return prettyBytes(num);
  }
  return '0 B';
};

export const dateToLocalString = (date?: number) => (date ? new Date(date).toLocaleString() : undefined);
