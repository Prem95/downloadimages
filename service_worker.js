chrome.omnibox.onInputEntered.addListener((text) => {
    const url = `https://github.com/search?q=${encodeURIComponent(text)}&type=issues`
    chrome.tabs.create({ url })
  });