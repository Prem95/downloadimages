// Content script functionality
console.log('Content script loaded');



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message);
  if (message.action === "downloadImages") {
    const images = Array.from(document.images);
    const imageData = images.slice(0, 100).map((img, index) => ({
      file_name: img.src.split('/').pop() || `image_${index + 1}`,
      file_download_path: img.src,
      file_downloaded: 'NO'
    }));

    const csvContent = generateCSV(imageData);
    const csvDataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);

    sendResponse({ success: true, csvDataUrl, totalImages: imageData.length });
  }
  return true; // Keeps the message channel open for asynchronous responses
});

function generateCSV(data: any[]): string {
  const header = ['file_name', 'file_download_path', 'file_downloaded'];
  const csvRows = [
    header.join(','),
    ...data.map(row => `${row.file_name},${row.file_download_path},${row.file_downloaded}`)
  ];
  return csvRows.join('\n');
}

export {}; // This export is necessary to make TypeScript treat this as a module