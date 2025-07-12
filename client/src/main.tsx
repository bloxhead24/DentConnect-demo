import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./polyfills/ie11";
import { applyWindowsFixes, addWindowsEventListeners } from "./utils/windowsCompatibility";

// Apply Windows compatibility fixes
applyWindowsFixes();

// Add Windows event listeners
document.addEventListener('DOMContentLoaded', () => {
  addWindowsEventListeners();
});

// Enhanced error handling and fallback loading
function initApp() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  try {
    // Check for different app modes
    const testMode = window.location.search.includes('test=simple');
    const minimalMode = window.location.search.includes('minimal=true') || window.location.pathname === '/minimal';
    
    if (minimalMode) {
      // Load ultra-lightweight version first
      import('./App.minimal').then(({ default: MinimalApp }) => {
        try {
          createRoot(rootElement).render(<MinimalApp />);
        } catch (error) {
          console.error("Error rendering minimal app:", error);
          showFallbackUI(rootElement);
        }
      }).catch(error => {
        console.error("Error loading minimal app:", error);
        showFallbackUI(rootElement);
      });
    } else if (testMode) {
      import('./App.simple').then(({ default: SimpleApp }) => {
        try {
          createRoot(rootElement).render(
            <React.StrictMode>
              <SimpleApp />
            </React.StrictMode>
          );
        } catch (error) {
          console.error("Error rendering simple app:", error);
          showFallbackUI(rootElement);
        }
      }).catch(error => {
        console.error("Error loading simple app:", error);
        showFallbackUI(rootElement);
      });
    } else {
      // Try main app with timeout fallback
      const loadTimeout = setTimeout(() => {
        console.warn("Main app taking too long to load, falling back to minimal version");
        window.location.search = '?minimal=true';
      }, 5000);
      
      import('./App').then(({ default: App }) => {
        clearTimeout(loadTimeout);
        try {
          createRoot(rootElement).render(
            <React.StrictMode>
              <App />
            </React.StrictMode>
          );
        } catch (error) {
          console.error("Error rendering main app:", error);
          showFallbackUI(rootElement);
        }
      }).catch(error => {
        clearTimeout(loadTimeout);
        console.error("Error loading main app:", error);
        showFallbackUI(rootElement);
      });
    }
  } catch (error) {
    console.error("Critical error in app initialization:", error);
    showFallbackUI(rootElement);
  }
}

function showFallbackUI(rootElement: HTMLElement) {
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #e0f2f1 0%, #e1f5fe 100%);">
      <div style="text-align: center; max-width: 600px; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <div style="font-size: 48px; margin-bottom: 20px;">🦷</div>
        <h1 style="color: #0d9488; font-size: 2.5rem; margin: 0 0 16px 0; font-weight: 700;">DentConnect</h1>
        <p style="color: #6b7280; font-size: 1.1rem; margin: 0 0 24px 0; line-height: 1.5;">
          Find available dental appointments near you
        </p>
        
        <div style="margin: 32px 0;">
          <h2 style="color: #374151; font-size: 1.25rem; margin-bottom: 20px;">What type of treatment do you need?</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 24px 0;">
            <button onclick="alert('🚨 Emergency treatment selected! This is a demo - visit dentconnect.replit.app for early access.')" 
                    style="padding: 20px; border: 2px solid #dc2626; border-radius: 12px; background: white; cursor: pointer; transition: all 0.3s; text-align: left;">
              <div style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">🚨 Emergency</div>
              <div style="color: #6b7280; font-size: 0.9rem;">Immediate dental care needed</div>
            </button>
            
            <button onclick="alert('⚡ Urgent treatment selected! This is a demo - visit dentconnect.replit.app for early access.')" 
                    style="padding: 20px; border: 2px solid #f59e0b; border-radius: 12px; background: white; cursor: pointer; transition: all 0.3s; text-align: left;">
              <div style="font-weight: 600; color: #f59e0b; margin-bottom: 8px;">⚡ Urgent</div>
              <div style="color: #6b7280; font-size: 0.9rem;">Pain relief and urgent care</div>
            </button>
            
            <button onclick="alert('✅ Routine treatment selected! This is a demo - visit dentconnect.replit.app for early access.')" 
                    style="padding: 20px; border: 2px solid #10b981; border-radius: 12px; background: white; cursor: pointer; transition: all 0.3s; text-align: left;">
              <div style="font-weight: 600; color: #10b981; margin-bottom: 8px;">✅ Routine</div>
              <div style="color: #6b7280; font-size: 0.9rem;">Regular check-up and cleaning</div>
            </button>
            
            <button onclick="alert('✨ Cosmetic treatment selected! This is a demo - visit dentconnect.replit.app for early access.')" 
                    style="padding: 20px; border: 2px solid #8b5cf6; border-radius: 12px; background: white; cursor: pointer; transition: all 0.3s; text-align: left;">
              <div style="font-weight: 600; color: #8b5cf6; margin-bottom: 8px;">✨ Cosmetic</div>
              <div style="color: #6b7280; font-size: 0.9rem;">Aesthetic dental treatments</div>
            </button>
          </div>
        </div>
        
        <div style="margin: 32px 0; padding: 20px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px;">
          <div style="font-weight: 600; color: #0369a1; margin-bottom: 8px;">🏆 Demo Mode - Universal Compatibility</div>
          <div style="color: #0369a1; font-size: 0.9rem;">
            This fallback version works on all devices and browsers
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.location.href='/?minimal=true'" 
                  style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Fast Version
          </button>
          <button onclick="window.location.href='/fallback'" 
                  style="padding: 12px 24px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Simple Version
          </button>
          <button onclick="window.location.reload()" 
                  style="padding: 12px 24px; background: #0d9488; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Try Again
          </button>
          <button onclick="window.open('https://dentconnect.replit.app/', '_blank')" 
                  style="padding: 12px 24px; background: white; color: #0d9488; border: 2px solid #0d9488; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Early Access
          </button>
        </div>
      </div>
    </div>
  `;
}

// Initialize the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
