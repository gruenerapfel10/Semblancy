// components/ContentOnlyWrapper.js
"use client";

import { useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

/**
 * This component wraps the children content and handles
 * the contentOnly mode for iframe tabs
 */
const ContentOnlyWrapper = ({ children }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const isContentOnly = searchParams.get('contentOnly') === 'true';
  const tabId = parseInt(searchParams.get('tabId') || '0', 10);
  
  useEffect(() => {
    // Only run in content-only mode
    if (!isContentOnly) return;
    
    // Communication with parent window
    const sendMessageToParent = (type, data) => {
      if (window.parent !== window) {
        window.parent.postMessage({
          type,
          tabId,
          data
        }, '*');
      }
    };
    
    // Send initial title
    sendMessageToParent('TITLE_CHANGE', { title: document.title });
    
    // Set up a mutation observer to watch for title changes
    const titleObserver = new MutationObserver(() => {
      sendMessageToParent('TITLE_CHANGE', { title: document.title });
    });
    
    // Observe the title element if it exists
    const titleEl = document.querySelector('title');
    if (titleEl) {
      titleObserver.observe(titleEl, {
        subtree: true,
        characterData: true,
        childList: true
      });
    } else {
      // If no title element exists, observe the head for when it gets added
      titleObserver.observe(document.head, {
        subtree: true,
        childList: true
      });
    }
    
    // Intercept all link clicks to maintain the contentOnly parameter
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      
      // Only handle internal links
      if (link.origin === window.location.origin) {
        e.preventDefault();
        
        // Get the href
        const href = link.getAttribute('href');
        
        // Add our parameters to maintain content-only mode
        const url = new URL(href, window.location.origin);
        url.searchParams.set('contentOnly', 'true');
        url.searchParams.set('tabId', tabId.toString());
        
        // Navigate within the iframe
        window.location.href = url.toString();
        
        // Inform the parent about the navigation
        sendMessageToParent('NAVIGATION', { url: href });
      }
    });
    
    // Handle history navigation (back/forward buttons)
    const handlePopState = () => {
      // Inform parent of URL change, but exclude our parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('contentOnly');
      url.searchParams.delete('tabId');
      
      sendMessageToParent('NAVIGATION', { url: url.pathname });
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      titleObserver.disconnect();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isContentOnly, tabId, pathname]);
  
  // In content-only mode, render just the children with minimal wrapper
  if (isContentOnly) {
    return (
      <div className="content-only-container" style={{ padding: '20px' }}>
        {children}
      </div>
    );
  }
  
  // In normal mode, just pass through children
  return children;
};

export default ContentOnlyWrapper;