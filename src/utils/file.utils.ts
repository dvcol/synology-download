export function readJsonFile<T extends Record<string, any>>(file: File): Promise<T> {
  const { promise, resolve, reject } = Promise.withResolvers<T>();

  const reader = new FileReader();
  reader.addEventListener('load', e => {
    try {
      const content = e.target?.result as string;
      resolve(JSON.parse(content));
    } catch (error) {
      reject(error);
    }
  });

  reader.addEventListener('error', () => {
    reject(new Error('Failed to read file'));
  });
  reader.readAsText(file);
  return promise;
}
