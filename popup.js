function executable() {
    alert(window.getSelection().toString()[0]);
}

/*
const tabId = getTabId()
chrome.scripting.executeScript( {
    func: executable,
    target: {tabId: tabId}
  });
*/