// Windows browser compatibility utilities
export function isWindowsBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Windows/.test(navigator.userAgent) ||
         /Edge/.test(navigator.userAgent) ||
         /Trident/.test(navigator.userAgent);
}

export function isInternetExplorer(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /MSIE|Trident/.test(navigator.userAgent);
}

export function isEdge(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Edge/.test(navigator.userAgent);
}

export function applyWindowsFixes(): void {
  if (typeof window === 'undefined') return;
  
  // Critical Windows browser fixes
  fixNavigatorAPI();
  fixDOMTiming();
  fixES6Compatibility();
  
  // Fix for Windows touch events
  if (isWindowsBrowser()) {
    document.body.style.touchAction = 'manipulation';
    document.body.style.msUserSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }
  
  // Fix for Internet Explorer
  if (isInternetExplorer()) {
    addIEPolyfills();
  }
  
  // Fix for Edge-specific issues
  if (isEdge()) {
    fixEdgeIssues();
  }
}

function fixNavigatorAPI(): void {
  // Fix navigator.share for Windows browsers that don't support it
  if (!navigator.share) {
    (navigator as any).share = function(data: any) {
      return new Promise((resolve, reject) => {
        // Fallback to copying to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(data.url || data.text || '').then(resolve).catch(reject);
        } else {
          // Fallback for older Windows browsers
          const textArea = document.createElement('textarea');
          textArea.value = data.url || data.text || '';
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            resolve(undefined);
          } catch (e) {
            reject(e);
          } finally {
            document.body.removeChild(textArea);
          }
        }
      });
    };
  }
  
  // Fix navigator.clipboard for Windows browsers
  if (!navigator.clipboard) {
    (navigator as any).clipboard = {
      writeText: function(text: string) {
        return new Promise((resolve, reject) => {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            resolve(undefined);
          } catch (e) {
            reject(e);
          } finally {
            document.body.removeChild(textArea);
          }
        });
      }
    };
  }
}

function fixDOMTiming(): void {
  // Fix DOM ready timing for Windows browsers
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Force a reflow to ensure proper rendering on Windows
      document.body.offsetHeight;
    });
  } else {
    // Document is already ready, force reflow
    setTimeout(() => {
      document.body.offsetHeight;
    }, 0);
  }
}

function fixES6Compatibility(): void {
  // Add Promise polyfill for older Windows browsers
  if (!window.Promise) {
    window.Promise = function(executor: any) {
      const self = this;
      self.state = 'pending';
      self.value = undefined;
      self.handlers = [];
      
      function resolve(result: any) {
        if (self.state === 'pending') {
          self.state = 'fulfilled';
          self.value = result;
          self.handlers.forEach(handle);
          self.handlers = [];
        }
      }
      
      function reject(error: any) {
        if (self.state === 'pending') {
          self.state = 'rejected';
          self.value = error;
          self.handlers.forEach(handle);
          self.handlers = [];
        }
      }
      
      function handle(handler: any) {
        if (self.state === 'pending') {
          self.handlers.push(handler);
        } else {
          if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
            handler.onFulfilled(self.value);
          }
          if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
            handler.onRejected(self.value);
          }
        }
      }
      
      this.then = function(onFulfilled: any, onRejected: any) {
        return new Promise((resolve: any, reject: any) => {
          handle({
            onFulfilled: function(result: any) {
              try {
                resolve(onFulfilled ? onFulfilled(result) : result);
              } catch (ex) {
                reject(ex);
              }
            },
            onRejected: function(error: any) {
              try {
                resolve(onRejected ? onRejected(error) : error);
              } catch (ex) {
                reject(ex);
              }
            }
          });
        });
      };
      
      executor(resolve, reject);
    } as any;
  }
  
  // Add fetch polyfill for older Windows browsers
  if (!window.fetch) {
    window.fetch = function(url: string, options: any = {}) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);
        
        if (options.headers) {
          Object.keys(options.headers).forEach(key => {
            xhr.setRequestHeader(key, options.headers[key]);
          });
        }
        
        xhr.onload = () => {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            text: () => Promise.resolve(xhr.responseText),
            json: () => Promise.resolve(JSON.parse(xhr.responseText))
          } as any);
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(options.body);
      });
    };
  }
}

function addIEPolyfills(): void {
  // Add IE-specific polyfills
  if (!Array.prototype.find) {
    Array.prototype.find = function(predicate: any) {
      for (let i = 0; i < this.length; i++) {
        if (predicate(this[i], i, this)) {
          return this[i];
        }
      }
      return undefined;
    };
  }
  
  if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement: any) {
      return this.indexOf(searchElement) !== -1;
    };
  }
  
  if (!String.prototype.includes) {
    String.prototype.includes = function(searchString: string) {
      return this.indexOf(searchString) !== -1;
    };
  }
  
  if (!Object.assign) {
    Object.assign = function(target: any, ...sources: any[]) {
      sources.forEach(source => {
        if (source) {
          Object.keys(source).forEach(key => {
            target[key] = source[key];
          });
        }
      });
      return target;
    };
  }
}

function fixEdgeIssues(): void {
  // Prevent Edge from showing password reveal button
  const inputs = document.querySelectorAll('input[type="password"]');
  inputs.forEach((input: any) => {
    input.style.msRevealButton = 'none';
  });
  
  // Fix Edge-specific CSS issues
  document.documentElement.style.msOverflowStyle = 'scrollbar';
}

export function addWindowsEventListeners(): void {
  if (typeof window === 'undefined') return;
  
  // Fix for Windows resize events
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Trigger reflow for Windows browsers
      document.body.style.height = 'auto';
      document.body.offsetHeight; // Force reflow
    }, 100);
  });
  
  // Fix for Windows focus events
  document.addEventListener('focusin', (e) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.outline = 'none';
    }
  });
  
  // Fix for Windows scroll events
  document.addEventListener('scroll', () => {
    // Prevent overscroll bounce on Windows
    if (window.scrollY < 0) {
      window.scrollTo(0, 0);
    }
  }, { passive: true });
}