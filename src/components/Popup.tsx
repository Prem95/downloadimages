import React, { useState } from 'react';

const Popup: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [totalImages, setTotalImages] = useState(0);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setStatus('Scraping images...');
    setProgress(0);
    setTotalImages(0);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id && tab.url) {
        chrome.tabs.sendMessage(tab.id, { action: "downloadImages" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError.message);
            setStatus('Error: ' + chrome.runtime.lastError.message);
            setDownloading(false);
            return;
          } else if (response && response.success) {
            setTotalImages(response.totalImages);
            setStatus(`${response.totalImages} images processed. CSV file ready for download.`);
            
            // Generate filename with domain and current datetime
            const domain = tab.url ? new URL(tab.url).hostname : 'unknown';
            const currentDateTime = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `${domain}_${currentDateTime}.csv`;
            
            const downloadLink = document.createElement('a');
            downloadLink.href = response.csvDataUrl;
            downloadLink.download = fileName;
            downloadLink.click();
          } else {
            setStatus('Failed to process images.');
          }
          setDownloading(false);
          setProgress(100);
        });

        // Simulate progress
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return prev;
            }
            return prev + 10;
          });
        }, 500);
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('An error occurred. Please try again.');
      setDownloading(false);
    }
  };

  return (
    <div style={{
      width: '300px',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: '0 0 20px', color: '#333', textAlign: 'center' }}>Image Downloader</h2>
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#4CAF50',
          transition: 'width 0.5s'
        }} />
      </div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: downloading ? '#cccccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: downloading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s'
        }}
      >
        {downloading ? 'Processing...' : 'Download Images CSV'}
      </button>
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        {status}
      </div>
      {totalImages > 0 && (
        <div style={{
          marginTop: '10px',
          textAlign: 'center',
          color: '#4CAF50',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          Total Images: {totalImages}
        </div>
      )}
    </div>
  );
};

export default Popup;