function fireCrawly() {
  chrome.tabs.executeScript({
    file: 'crawly.js'
  });
}

document.getElementById('analyticsButton').addEventListener('click', fireCrawly);
var csv = "data:text/csv;charset=utf-8,";

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.names)

    console.log(request.names);

      var download = document.createElement("a")
      download.innerHTML = "Download Analytics Data";

      download.href = request.names;
      download.target = '_blank';
      download.download = request.host + '_event_names.csv';
      document.body.appendChild(download);


  });
