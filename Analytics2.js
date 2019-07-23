import { PrintEvent } from './Utils.js';

let siteData = {};

class Analytics {
  constructor(win = {}){

    const analyticsQName = win.YextAnalyticsObject || 'ya';
    const _this = this;

    this.dom = win.document;
    Object.assign(siteData, {
      pageurl: win.location.pathname,
      pagesReferrer: win.document.referrer
    });

    this.registeredListeners = {};
    this.StandardEvents = {
      WebsiteClick: 'website',
      DrivingDirections: 'directions',
      MobileCall: 'phone',
      CTAClick: 'cta'
    };
    this.delayNavigation = true;
  }

  static trackEvent(eventName, data, cb) {
    return Analytics.send({eventType: eventName}, data, cb);
  }

  static send(data, pixelInfo, cb) {
    return this.fire(this.pixelURL(data, pixelInfo), cb);
  }

  static seed() {
    return Date.now() + Math.floor(1000 * Math.random());
  }

  static pixelURL(optionalData, data) {
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

    if (optionalData.eventType) {
      PrintEvent(optionalData.eventType);
    }

    return p;
  }

  static fire(pixel, cb) {
    return pixel
  }
}

export{
  Analytics
}
