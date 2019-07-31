function fireCrawly() {
  chrome.tabs.executeScript({
    file: 'crawly.js'
  });
}

document.getElementById('analyticsButton').addEventListener('click', fireCrawly);
