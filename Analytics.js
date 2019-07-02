import { DelayNavigation as NavigateAfterActionIfNeeded } from './DelayNavigation.js';
import { CalcEventNameForElement, SelectorTracking, SearchElementForSelector } from './Helpers.js';
import { PrintEvent } from './Utils.js';
import { OnReady } from "./Browser.js";
// import 'slugify';

let siteData = {};

class Analytics {
  // Takes Window as reference for better minification references
  constructor(win = {}, eventNameCalculator = CalcEventNameForElement) {
    const analyticsQName = win.YextAnalyticsObject || 'ya';
    const _this = this;
    this._eventNameCalculator = eventNameCalculator;

    this.dom = win.document;
    Object.assign(siteData, {
      pageurl: win.location.pathname,
      pagesReferrer: win.document.referrer
    });

  //need to get the right variables

    // { businessId: busId, siteId: site, isStaging: staging }
    // this.set({ pageurl: win.location.pathname, pagesReferrer: win.document.referrer });
    this.registeredListeners = {};
    this.StandardEvents = {
      WebsiteClick: 'website',
      DrivingDirections: 'directions',
      MobileCall: 'phone',
      CTAClick: 'cta'
    };
    this.delayNavigation = true;

    OnReady(()=>{
      // Always observe clicks so we can fire the catch-all interaction events
      this.registerObserver('click');

      // Drain the command queue, if present
      if (win[analyticsQName]) {
        const cq = win[analyticsQName].q || [];
        while (cq.length) {
          let cmd = cq.shift();
          const commandArgs = [].slice.apply(cmd);
          this.processCommand(...commandArgs);
        }
      }

      // Replace the command queue with a proxy to this instance
      win[analyticsQName] = function() {
        _this.processCommand.apply(_this, [].slice.apply(arguments));
      };
    });
  }

  setCalcEventName(calculator) {
    this._eventNameCalculator = calculator;
  }

  CalcEventNameForElement(target) {
    return this._eventNameCalculator(target);
  }

  loaded() {
    return this.siteData.siteId != undefined &&
      this.siteData.businessId != undefined;
  }

  create(busId, site, staging) {
    // this.set();
    Object.assign(siteData, { businessId: busId, siteId: site, isStaging: staging });

    return true;
  }

  set(data) {
    this.siteData = this.siteData || {};
    Object.assign(this.siteData, data);
  }

  setDelayNavigation(bool) {
    this.delayNavigation = bool;
  }

  pageview() {
    this.send({ eventType: 'pageview' });
  }

  click(opts) {
    this.registerObserverForSelector('click', opts.selector, opts.name);
  }

  static trackEvent(eventName, cb) {
    Analytics.send({eventType: eventName}, cb);
  }

  // Internal from here on out!

  once(task){
    if (!task)
      return;

    let invoked = false;
    return function(){
      if (invoked)
        return;
      invoked = true;
      task();
    }
  }

  static send(data, cb) {
    this.fire(this.pixelURL(data), cb);
  }

  registerObserverForSelector(eventType, selector, eventName) {
    this.registerObserver(eventType);
    // GENERATOR TODO: Do we want to be able to track multiple events for the same selector?
    SelectorTracking[selector] = eventName;
  }

  registerObserver(eventType) {
    if (!this.registeredListeners.hasOwnProperty(eventType)) {
      const _this = this;
      // this used to call a polyfill at the top of the page that was migrated to
      // the Polyfills Components (test in IE)
      this.dom.body.addEventListener(eventType, function (e) {
        _this.handleEvent(e);
      });
      this.registeredListeners[eventType] = true;
    }
  }

  unRegisterObserver(eventType, selector, eventName) {
    if (SelectorTracking.hasOwnProperty(selector)) {
      delete SelectorTracking[selector];
    }
    // GENERATOR TODO: coordinate remove of selector tracking with unregistering event listener
  }

  processCommand() {
    if (arguments.length === 0) {
      throw 'Received Analytics Command with no Arguments';
    }
    const command = arguments[0];
    const remainingArgs = [].slice.apply(arguments).slice(1);

    if (typeof this[command] === 'function') {
      return this[command](...remainingArgs);
    } else {
      throw `Unknown command ${command}`;
    }
  }

  static pixelURL(optionalData) {
    let combinedData = {};
    // todo Look at this.siteData
    Object.assign(combinedData, siteData);
    Object.assign(combinedData, optionalData);
    combinedData.v = this.seed();
    combinedData.businessids = combinedData.businessId;
    delete combinedData.businessId;
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

  static seed() {
    return Date.now() + Math.floor(1000 * Math.random());
  }

  static fire(pixel, cb) {

//need to find a way to get this working...

    // if (!this.loaded()) {
    //   throw new Error(
    //     `Attempted to observe fire ${pixel} on ${event.type} before initializing Yext.Analytics.SiteData`,
    //   );
    // }

    // const px = this.dom.createElement('img');
    // px.src = pixel;
    // px.style.width = '0';
    // px.style.height = '0';
    // px.style.position = 'absolute';
    // px.alt = '';


    if (cb) {
      // The callback passed to this function should be invoked after the pixel has successfully
      // fired and we're confident the tracking server has received the request.  The most common
      // use of the callback is to navigate the user agent away from the current domain - say, a click
      // on an anchor tag with an off-domain href.  In those situations, we want to 'delay' the
      // actual browser navigation because the act of moving to another domain will cause some
      // user agents to cancel all in-flight network requests that the current page originated,
      // including an image load like the one we use here for analytics transport.
      //
      // That said, its critical that the callback is _eventually_ invoked since it represents
      // preservation of the user's intent (to navigate away).  `onload` and `onerror` provide
      // most of the coverage we need - the majority of the time the pixel should load in < 100ms,
      // and in the unlikely scenario the pixel server was unavailable the error should happen
      // quickly.  However, there are situations in which the user-agent could connect to the
      // pixel server but listen indefinitely for a response - high load or stuck threads, for
      // example.  The setTimeout(), thereforce, acts as an absolute failsafe.
      //
      // The once wrapper ensures that the cb function is only invoked a single time.
      // let onceCB = this.once(cb)
      // px.onload = onceCB;
      // px.onerror = onceCB;
      // setTimeout(onceCB, 1000);
    }

    // we don't need to append an img
    // this.dom.body.appendChild(px);
  }

  fireWithEvent(pixel, event) {
    if (this.delayNavigation) {
      NavigateAfterActionIfNeeded(
        (done) => {
          this.fire(pixel, done);
        },
        event,
      );
    } else {
      this.fire(pixel);
    }
  }

  // analyticsSlug(text) {
  //   return slugify(text, '_').toLowerCase();
  // }

  handleEvent(event) {
    for (let selector in SelectorTracking) {
      if (SelectorTracking.hasOwnProperty(selector)) {
        if (SearchElementForSelector(event.target, selector)) {
          this.fireWithEvent(this.pixelURL({ eventType: SelectorTracking[selector] }), event);
          return; // prevent double counting
        }
      }
    }
    let eventName = this.CalcEventNameForElement(event.target);
    if (!eventName) return; // could not track
    this.fireWithEvent(this.pixelURL({ eventType: eventName }), event);
  }
}

// const win = {
//   document: {
//     referrer: ''
//   },
//   location: {
//     pathname: ''
//   }
// };

// const Instance = new Analytics();

export {
  Analytics
  // Instance
}
