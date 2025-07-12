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
  
  // Fix for Windows touch events
  if (isWindowsBrowser()) {
    document.body.style.touchAction = 'manipulation';
    document.body.style.msUserSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }
  
  // Fix for Internet Explorer
  if (isInternetExplorer()) {
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
  }
  
  // Fix for Edge-specific issues
  if (isEdge()) {
    // Prevent Edge from showing password reveal button
    const inputs = document.querySelectorAll('input[type="password"]');
    inputs.forEach((input: any) => {
      input.style.msRevealButton = 'none';
    });
  }
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