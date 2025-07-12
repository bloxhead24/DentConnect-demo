// Internet Explorer 11 compatibility polyfills
// This file ensures the app works on older Windows browsers

// Only load polyfills if we're in a browser environment
if (typeof window !== 'undefined') {
  // 1. Object.assign polyfill
  if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      value: function assign(target: any) {
        'use strict';
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        const to = Object(target);
        for (let index = 1; index < arguments.length; index++) {
          const nextSource = arguments[index];
          if (nextSource != null) {
            for (const nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }

  // 2. Array.prototype.find polyfill
  if (!Array.prototype.find) {
    Array.prototype.find = function(predicate: any) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      const list = Object(this);
      const length = parseInt(list.length) || 0;
      const thisArg = arguments[1];
      for (let i = 0; i < length; i++) {
        if (predicate.call(thisArg, list[i], i, list)) {
          return list[i];
        }
      }
      return undefined;
    };
  }

  // 3. Array.prototype.includes polyfill
  if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement: any, fromIndex: any) {
      'use strict';
      fromIndex = fromIndex || 0;
      const o = Object(this);
      const len = parseInt(o.length) || 0;
      if (len === 0) return false;
      const n = parseInt(fromIndex) || 0;
      let k = n >= 0 ? n : Math.max(len + n, 0);
      while (k < len) {
        if (o[k] === searchElement) return true;
        k++;
      }
      return false;
    };
  }

  // 4. String.prototype.includes polyfill
  if (!String.prototype.includes) {
    String.prototype.includes = function(search: string, start: any) {
      'use strict';
      start = start || 0;
      if (typeof start !== 'number') {
        start = 0;
      }
      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }

  // 5. Promise polyfill (comprehensive)
  if (!window.Promise) {
    const isFunction = (obj: any) => typeof obj === 'function';
    const isObject = (obj: any) => typeof obj === 'object';
    const isArray = (obj: any) => Array.isArray(obj);
    const isThenable = (obj: any) => obj && isFunction(obj.then);

    const PENDING = 'pending';
    const FULFILLED = 'fulfilled';
    const REJECTED = 'rejected';

    class SimplePromise {
      private state: string = PENDING;
      private value: any = undefined;
      private handlers: any[] = [];

      constructor(executor: (resolve: any, reject: any) => void) {
        try {
          executor(this.resolve.bind(this), this.reject.bind(this));
        } catch (error) {
          this.reject(error);
        }
      }

      private resolve(value: any) {
        if (this.state === PENDING) {
          this.state = FULFILLED;
          this.value = value;
          this.handlers.forEach(this.handle.bind(this));
          this.handlers = [];
        }
      }

      private reject(reason: any) {
        if (this.state === PENDING) {
          this.state = REJECTED;
          this.value = reason;
          this.handlers.forEach(this.handle.bind(this));
          this.handlers = [];
        }
      }

      private handle(handler: any) {
        if (this.state === PENDING) {
          this.handlers.push(handler);
        } else {
          if (this.state === FULFILLED && isFunction(handler.onFulfilled)) {
            handler.onFulfilled(this.value);
          }
          if (this.state === REJECTED && isFunction(handler.onRejected)) {
            handler.onRejected(this.value);
          }
        }
      }

      then(onFulfilled?: any, onRejected?: any) {
        return new SimplePromise((resolve, reject) => {
          this.handle({
            onFulfilled: (value: any) => {
              if (isFunction(onFulfilled)) {
                try {
                  resolve(onFulfilled(value));
                } catch (error) {
                  reject(error);
                }
              } else {
                resolve(value);
              }
            },
            onRejected: (reason: any) => {
              if (isFunction(onRejected)) {
                try {
                  resolve(onRejected(reason));
                } catch (error) {
                  reject(error);
                }
              } else {
                reject(reason);
              }
            }
          });
        });
      }

      catch(onRejected: any) {
        return this.then(undefined, onRejected);
      }

      static resolve(value: any) {
        return new SimplePromise((resolve) => resolve(value));
      }

      static reject(reason: any) {
        return new SimplePromise((_, reject) => reject(reason));
      }
    }

    window.Promise = SimplePromise as any;
  }

  // 6. Fetch polyfill for IE11
  if (!window.fetch) {
    window.fetch = function(url: string, init: any = {}) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(init.method || 'GET', url, true);
        
        if (init.headers) {
          Object.keys(init.headers).forEach(key => {
            xhr.setRequestHeader(key, init.headers[key]);
          });
        }
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            const response = {
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Map(),
              text: () => Promise.resolve(xhr.responseText),
              json: () => Promise.resolve(JSON.parse(xhr.responseText))
            };
            resolve(response as any);
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(init.body || null);
      });
    };
  }

  // 7. Element.closest polyfill
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(selector: string) {
      let element = this;
      while (element && element.nodeType === 1) {
        if (element.matches && element.matches(selector)) {
          return element;
        }
        element = element.parentElement;
      }
      return null;
    };
  }

  // 8. Element.matches polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches = 
      Element.prototype.matchesSelector ||
      (Element.prototype as any).mozMatchesSelector ||
      (Element.prototype as any).msMatchesSelector ||
      (Element.prototype as any).oMatchesSelector ||
      (Element.prototype as any).webkitMatchesSelector ||
      function(selector: string) {
        const matches = (this.document || this.ownerDocument).querySelectorAll(selector);
        let i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
  }

  // 9. classList polyfill for IE11
  if (!('classList' in document.documentElement)) {
    (function(view) {
      'use strict';
      const ClassList = function(elem: any) {
        const trimmedClasses = elem.getAttribute('class').trim();
        const classes = trimmedClasses ? trimmedClasses.split(' ') : [];
        for (let i = 0; i < classes.length; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function() {
          elem.setAttribute('class', this.toString());
        };
      };
      const classListProto = ClassList.prototype = [];
      classListProto.item = function(i: number) {
        return this[i] || null;
      };
      classListProto.contains = function(token: string) {
        return this.indexOf(token) !== -1;
      };
      classListProto.add = function() {
        const tokens = Array.prototype.slice.call(arguments);
        let i = 0;
        const l = tokens.length;
        let token;
        let updated = false;
        do {
          token = tokens[i] + '';
          if (this.indexOf(token) === -1) {
            this.push(token);
            updated = true;
          }
        } while (++i < l);
        if (updated) {
          this._updateClassName();
        }
      };
      classListProto.remove = function() {
        const tokens = Array.prototype.slice.call(arguments);
        let i = 0;
        const l = tokens.length;
        let token;
        let updated = false;
        do {
          token = tokens[i] + '';
          const index = this.indexOf(token);
          if (index !== -1) {
            this.splice(index, 1);
            updated = true;
          }
        } while (++i < l);
        if (updated) {
          this._updateClassName();
        }
      };
      classListProto.toggle = function(token: string, force?: boolean) {
        token += '';
        const result = this.contains(token);
        const method = result ? force !== true && 'remove' : force !== false && 'add';
        if (method) {
          this[method](token);
        }
        return !result;
      };
      classListProto.toString = function() {
        return this.join(' ');
      };
      Object.defineProperty(view.Element.prototype, 'classList', {
        get: function() {
          return new ClassList(this);
        },
        enumerable: true,
        configurable: true
      });
    }(window));
  }

  // 10. Event polyfill for IE11
  if (!window.Event || typeof window.Event !== 'function') {
    window.Event = function(type: string, eventInitDict: any = {}) {
      const event = document.createEvent('Event');
      event.initEvent(type, Boolean(eventInitDict.bubbles), Boolean(eventInitDict.cancelable));
      return event;
    } as any;
  }

  // 11. CustomEvent polyfill for IE11
  if (!window.CustomEvent || typeof window.CustomEvent !== 'function') {
    window.CustomEvent = function(type: string, eventInitDict: any = {}) {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent(type, Boolean(eventInitDict.bubbles), Boolean(eventInitDict.cancelable), eventInitDict.detail);
      return event;
    } as any;
  }
}