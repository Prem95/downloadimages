document.addEventListener('DOMContentLoaded', function() {
    const downloadButton = document.getElementById('downloadButton');
    const progressBar = document.querySelector('#progressBar div');
    const statusDiv = document.getElementById('status');
  
    downloadButton.addEventListener('click', async function() {
      downloadButton.disabled = true;
      statusDiv.textContent = 'Scraping images...';
  
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const images = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: scrapeImages,
        });
  
        const imageData = images[0].result;
        if (imageData.length === 0) {
          statusDiv.textContent = 'No images found on this page.';
          downloadButton.disabled = false;
          return;
        }
  
        statusDiv.textContent = `Found ${imageData.length} images. Preparing CSV...`;
        const csvContent = generateCSV(imageData);
        downloadCSV(csvContent);
  
        statusDiv.textContent = 'CSV file downloaded successfully!';
      } catch (error) {
        console.error('Error:', error);
        statusDiv.textContent = 'An error occurred. Please try again.';
      } finally {
        downloadButton.disabled = false;
      }
    });
  
    function scrapeImages() {
      const images = Array.from(document.images);
      return images.slice(0, 100).map((img, index) => ({
        file_name: img.src.split('/').pop() || `image_${index + 1}`,
        file_download_path: img.src,
        file_downloaded: 'NO'
      }));
    }
  
    function generateCSV(data) {
      const header = ['file_name', 'file_download_path', 'file_downloaded'];
      const csvRows = [
        header.join(','),
        ...data.map(row => `${row.file_name},${row.file_download_path},${row.file_downloaded}`)
      ];
      return csvRows.join('\n');
    }
  
    function downloadCSV(content) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'image_data.csv';
      link.click();
      URL.revokeObjectURL(url);
    }
  });