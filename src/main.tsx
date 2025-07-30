import React from 'react';
import { createRoot } from 'react-dom/client';
import { ElementToolsApp } from '@/components/element-tools/ElementToolsApp';
import { initializeLiveCanvasUtils } from '@/utils';
import { checkWindowUtilities } from '@/utils/test';
import '@/globals.css';

// Initialize function for the plugin
function initializeLCElementTools() {
  console.log('LC Element Tools: Initializing with high-fidelity React components');
  
  // Initialize LiveCanvas utilities first for compatibility
  initializeLiveCanvasUtils();
  
  // Check that utilities are properly registered (development)
  setTimeout(() => checkWindowUtilities(), 100);
  
  const widget = document.getElementById('lc-element-tools-widget');
  if (!widget) {
    console.error('LC Element Tools: Widget container not found');
    return;
  }

  // Get iframe document for LiveCanvas integration
  const getIframeDoc = () => {
    const iframe = document.querySelector('#previewiframe') as HTMLIFrameElement;
    return iframe && iframe.contentDocument ? iframe.contentDocument : null;
  };

  // Render the high-fidelity React app
  const root = createRoot(widget);
  root.render(
    <ElementToolsApp 
      config={{ 
        iframeDoc: getIframeDoc() 
      }} 
    />
  );
  
  console.log('LC Element Tools: High-fidelity React app initialized successfully');
}

// Initialize immediately when loaded
if (typeof window !== 'undefined') {
  // Set up global access
  (window as any).LCElementTools = {
    init: initializeLCElementTools,
    ElementToolsApp
  };
  
  console.log('LC Element Tools: Global object initialized with high-fidelity components');
}

// Export for modules  
export { initializeLCElementTools as init, ElementToolsApp };
export default { init: initializeLCElementTools, ElementToolsApp };