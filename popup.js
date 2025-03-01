document.addEventListener('DOMContentLoaded', function() {
  const colors = ['black', 'gray', 'yellow'];
  
  // Check if there's a saved color in session storage
  chrome.storage.session.get(['selectedColor'], function(result) {
    if (result.selectedColor) {
      colors.forEach(color => {
        const element = document.getElementById(color);
        element.style.border = color === result.selectedColor ? '2px solid #4CAF50' : 'none';
      });
    }
  });

  colors.forEach(color => {
    document.getElementById(color).addEventListener('click', function() {
      // Save color preference to session storage
      chrome.storage.session.set({ selectedColor: color });
      
      // Update UI to show selected color
      colors.forEach(c => {
        document.getElementById(c).style.border = c === color ? '2px solid #4CAF50' : 'none';
      });

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'changeColor',
          color: color
        });
      });
    });
  });

  document.getElementById('reset').addEventListener('click', function() {
    // Clear stored color preference from session storage
    chrome.storage.session.remove(['selectedColor']);
    
    // Remove selection borders
    colors.forEach(color => {
      document.getElementById(color).style.border = 'none';
    });

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'reset'
      });
    });
  });
});