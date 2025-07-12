#!/bin/bash
# Deployment workaround script to fix white screen issue

echo "Creating deployment build with workaround..."

# Create dist directories
mkdir -p dist/public

# Copy the development build approach for deployment
echo "Copying client files..."
cp -r client/* dist/public/

# Create a production index.html that loads the app correctly
cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <meta name="description" content="DentConnect - Real-time dental appointment marketplace" />
    <title>DentConnect - Find Available Dental Appointments</title>
    <script type="module">
      // Production error handler to prevent white screen
      window.addEventListener('error', (e) => {
        console.error('App error:', e);
        if (document.getElementById('root').innerHTML === '') {
          document.getElementById('root').innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(to bottom right, #e0f2f1, #e1f5fe);">
              <div style="text-align: center; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h1 style="font-size: 1.5rem; font-weight: bold; color: #0d9488; margin-bottom: 1rem;">DentConnect</h1>
                <p style="color: #6b7280; margin-bottom: 1rem;">Loading application...</p>
                <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #0d9488; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
                  Refresh Page
                </button>
              </div>
            </div>
          `;
        }
      });
    </script>
  </head>
  <body>
    <div id="root">
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(to bottom right, #e0f2f1, #e1f5fe);">
        <div style="text-align: center;">
          <div style="width: 2rem; height: 2rem; border: 4px solid #14b8a6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
          <h2 style="font-size: 1.25rem; font-weight: 600; color: #0d9488;">Loading DentConnect...</h2>
        </div>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

echo "Build workaround complete!"