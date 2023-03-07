export const downloadJson = (obj: any, name: string) => {
  // Convert JSON Array to string.
  const json = JSON.stringify(obj);

  // Convert JSON string to BLOB.
  const blob1 = new Blob([json], { type: 'text/plain;charset=utf-8' });

  const url = window.URL || window.webkitURL;
  const a = document.createElement('a');
  a.download = name;
  a.href = url.createObjectURL(blob1);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
