function reddenPage() {
   console.log('123');
  }

chrome.runtime.onInstalled.addListener(() => {
    const tabId = getTabId();
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: reddenPage
    });
});