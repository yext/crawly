
var url = window.location.href;

//TODO: figure out url parsing - URI.js??????

var jsonUrl = url;

var urlParse = new URI(url);

var host = urlParse.host();
// var suffix = urlParse.suffix();
// //TODO: to try/if/else to see if it is a locator, then add forcejson as last resort?
// if (suffix == "html")
// {
//   jsonUrl = urlParse.suffix(json);
// }
// else if (suffix != "")
// {
//   jsonUrl = urlParse.suffix(com/index.json)
// }
// else

if(url.includes("search"))
{
  jsonUrl = jsonUrl + "?xYextForceJson=true";
}
else if(url.endsWith(".com"))
{
  jsonUrl = jsonUrl + "/index.json";
}
else if(url.endsWith(".com/"))
{
  jsonUrl = jsonUrl + "index.json";
}
else if(url.endsWith(".ca"))
{
  jsonUrl = jsonUrl + "/index.json";
}
else if(url.endsWith(".ca/"))
{
  jsonUrl = jsonUrl + "index.json";
}
else if(url.endsWith(".html"))
{
  jsonUrl = jsonUrl.substring(0, jsonUrl.length-5) + ".json";
}
else {
  jsonUrl = jsonUrl + ".json";
}

let names = [];
let downloadData = [];

function SearchElementForSelector(el, s) {
  while (el && (el.tagName && !el.matches(s))) {
    el = el.parentNode;
  }

  if (el && el.tagName && el.matches(s)) {
    return el;
  }
  return null;
}

function seed() {
  return Date.now() + Math.floor(1000 * Math.random());
}

function pixelURL(optionalData, data) {
  let combinedData = {};
  Object.assign(combinedData, data);
  Object.assign(combinedData, optionalData);
  combinedData.v = this.seed();
  let p = '//www.yext-pixel.com/store_pagespixel?product=storepages';
  for (var key in combinedData) {
    if (combinedData.hasOwnProperty(key)) {
      p += `&${key}=${encodeURIComponent(combinedData[key])}`;
    }
  }

  return p;
}

function GetParams(url) {
  let queries = {};
  let parts = url.split('?');
  if (parts.length == 2) {
    parts[1].split('&').forEach((pair)=>{
      let params = pair.split('=');
      queries[params[0]] = params[1];
    });
  }
  return queries;
}
function CheckAnchorQueries(anchor) {
  if (anchor && anchor.href) {
    let eName = GetParams(anchor.href)['ya-track'];
    if (eName) {
      return eName;
    }
  }
  return false;
}

let SelectorTracking = {};

var events = document.querySelectorAll('button, a, input');
events.forEach(function(element){
  try {
    let type = null;
    let trackDetails = null;
    let srcEl = null;


    for (const selector in SelectorTracking) {
      if (!element.matches(selector)) continue;
      trackDetails = SelectorTracking[selector];
    }

    if (!trackDetails) {
      let potentialYaTrackedEl = SearchElementForSelector(element, '[data-ya-track]');
      if (potentialYaTrackedEl) {
        srcEl = potentialYaTrackedEl;
        trackDetails = (potentialYaTrackedEl.dataset ? potentialYaTrackedEl.dataset.yaTrack : potentialYaTrackedEl.getAttribute('data-ya-track'));
      }
    }

    let preventDefaultEvent = SearchElementForSelector(element, '[data-ya-prevent-default]');

    let vectorMap = SearchElementForSelector(element, '.VectorMap-link');

    if (!preventDefaultEvent && !trackDetails && !vectorMap) {
      let anchor = SearchElementForSelector(element, 'a');
      if (anchor) {
        srcEl = anchor;
        let anchorQuery = CheckAnchorQueries(anchor);
        if (anchorQuery) trackDetails = anchorQuery;
        if (!anchorQuery && !trackDetails) {
          type = 'link';
        }
      }
    }

    if (!preventDefaultEvent && !trackDetails && !type && !vectorMap) {
      let button = SearchElementForSelector(element, 'button');
      if (button) {
        srcEl = button;
        type = 'button';
      }
    }

    if (!preventDefaultEvent && !trackDetails && !type && !vectorMap) {
      let input = SearchElementForSelector(element, 'input');
      if (input && input.type != 'hidden') {
        srcEl = input;
        type = 'input';
      }
    }

    let dataYaTrack = type || trackDetails;
    let name = null;

    if(dataYaTrack)
    {
      let scopeAncestors = [];
      while (element && element.tagName) {
        if (element.matches('[data-ya-scope]')) {
          scopeAncestors.push(element);
        }
        element = element.parentNode;
      }

      let tags = [srcEl].concat(scopeAncestors);
        for (const [hierarchyIdx, hierarchyElement] of tags.entries()) {
          let tagVal = (hierarchyIdx == 0) ? dataYaTrack : (hierarchyElement.dataset ? hierarchyElement.dataset.yaScope : hierarchyElement.getAttribute('data-ya-scope'))
          if (tagVal.indexOf('#') > -1) {
            let attributeName = hierarchyIdx == 0 ? 'data-ya-track': 'data-ya-scope';
            let ancestor = (hierarchyIdx + 1 < tags.length) ? tags[hierarchyIdx + 1]: document;
            let siblings = Array.from(ancestor.querySelectorAll(`[${attributeName}='${tagVal}']`));
            for (const [siblingIdx, sibling] of siblings.entries()) {
              if (hierarchyElement == sibling) {
                tagVal = tagVal.replace('#', siblingIdx + 1);
                break;
              }
            }
          }
          tags[hierarchyIdx] = tagVal;
        }
        let name = tags.reverse().join('_');
        names.push(name);
        downloadData.push(name+','+srcEl);

    }
  } catch (err){
    console.log(err);
  }
  });

async function pageJson() {
   var jsonData = {};
   await $.getJSON(jsonUrl, function(data) {

    var busId = data['businessId'];
    jsonData['businessids'] = data['businessId'];
    jsonData['siteId'] = data['siteId'];
    var template = data['soyTemplateName'];
    if (template.includes('search')){
      jsonData['searchId'] = data['searchId'];
    }
    if (template.includes('directory')){
      var crumbs = data['crumbNames'];
      var path = "";
      for (var i=1; i < crumbs.length; i++){
        if(i!=1)
        {
          path.concat("/");
        }
        path.concat(crumbs[i]);
      }
      jsonData['directoryPath'] = path;
      jsonData['directoryId'] = data['directoryId'];
    }
    if (template.includes('locationEntity')){
      jsonData['pageSetId'] = data['entitypagesetId'];
      jsonData['ids'] = data['profile']['meta']['yextId'];
    }
  });

  var pagesReferrer = window.document.referrer;
  var pageurl = window.location.pathname;

  var csv = "data:text/csv;charset=utf-8,%EF%BB%BF"+encodeURI('Name\n');

  jsonData['pagesReferrer'] = pagesReferrer;
  jsonData['pageurl'] = pageurl;
  names.forEach(function(name){
    var pixel = pixelURL({eventType: name}, jsonData)
    const px = document.createElement("img");
    px.src = pixel;
    px.style.width = '0';
    px.style.height = '0';
    px.style.position = 'absolute';
    px.alt = '';
    document.body.appendChild(px);
    csv = csv + encodeURI(name+'\n')
  });
  // console.log(downloadData);
  // downloadData.forEach(function(row) {
  //     csv = csv + encodeURI(row+'\n');
  // });

  // console.log(csv);

  chrome.runtime.sendMessage({names: csv, host: host});


}

pageJson();
