// Apply stored color when page loads
chrome.storage.session.get(['selectedColor'], function(result) {
  if (result.selectedColor) {
    applyColor(result.selectedColor);
  }
});

// Store original styles when first changing colors
let originalStyles = null;

function applyColor(color) {
  const colorMap = {
    'black': '#333333',
    'gray': '#808080',
    'yellow': '#F5E6CA'
  };
  
  const selectedColor = colorMap[color];
  const textColor = (color === 'yellow') ? '#000000' : '#FFFFFF';
  
  // Create comprehensive CSS rules
  const css = `
    body, html, 
    div, main, article, section, aside, nav,
    header, footer, 
    .container, .content, .wrapper,
    [class*="container"], [class*="content"], [class*="wrapper"],
    [class*="background"], [class*="bg-"],
    [id*="container"], [id*="content"], [id*="wrapper"],
    [role="main"], [role="contentinfo"], [role="complementary"] {
      background-color: ${selectedColor} !important;
      background-image: none !important;
    }
    
    body, html,
    div, main, article, section, p, span, h1, h2, h3, h4, h5, h6,
    a:not(:hover) {
      color: ${textColor} !important;
    }
    
    /* Handle semi-transparent backgrounds */
    * {
      background-color: transparent !important;
    }
    
    /* Force the body background */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: ${selectedColor} !important;
      z-index: -9999;
    }
  `;
  
  // Create or update the style element
  let style = document.getElementById('good-for-eyes-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'good-for-eyes-style';
    document.head.appendChild(style);
  }
  style.textContent = css;
  
  // Direct style application for immediate effect
  document.documentElement.style.backgroundColor = selectedColor;
  document.body.style.backgroundColor = selectedColor;
  
  // Handle all elements with background-related styles
  const elementsWithBackground = document.querySelectorAll('*');
  elementsWithBackground.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
        computedStyle.backgroundImage !== 'none') {
      element.style.setProperty('background-color', selectedColor, 'important');
      element.style.setProperty('background-image', 'none', 'important');
    }
  });
  
  // Create an observer for dynamically added content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            node.style.setProperty('background-color', selectedColor, 'important');
            node.style.setProperty('background-image', 'none', 'important');
          }
        });
      }
    });
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'reset') {
    // Remove our custom style element
    const style = document.getElementById('good-for-eyes-style');
    if (style) {
      style.remove();
    }

    // Reset direct styles on elements
    document.documentElement.style.backgroundColor = '';
    document.body.style.backgroundColor = '';
    
    // Remove all directly applied background styles
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      element.style.removeProperty('background-color');
      element.style.removeProperty('background-image');
      element.style.removeProperty('color');
    });

    return;
  }

  if (request.action === 'changeColor') {
    applyColor(request.color);
  }
});