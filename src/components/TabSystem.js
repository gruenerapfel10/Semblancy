import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './TabSystem.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

/**
 * This tab system uses iframes that load only the children content of pages
 * without the sidebar, header, and other layout elements
 */
const ComponentIframeTabSystem = () => {
  const router = useRouter();
  const pathname = usePathname();
  const frameRefs = useRef({});
  
  const [tabs, setTabs] = useState([
    { id: 1, title: 'Dashboard', url: '/dashboard/overview', active: true }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [nextTabId, setNextTabId] = useState(2);

  // Format the URL to ensure it only loads content portion
  const getFrameUrl = (url) => {
    // Add a query parameter to indicate this is for content only
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}contentOnly=true&tabId=${activeTabId}`;
  };

  // Function to capture current page title
  const updateTabTitleFromContent = (tabId) => {
    try {
      const frame = frameRefs.current[tabId];
      if (frame && frame.contentDocument) {
        const title = frame.contentDocument.title || 'New Tab';
        
        setTabs(prevTabs =>
          prevTabs.map(tab =>
            tab.id === tabId ? { ...tab, title: title } : tab
          )
        );
      }
    } catch (e) {
      // Security restrictions might prevent accessing contentDocument
      console.log('Unable to read iframe title:', e);
    }
  };

  // Handle iframe load events
  const handleIframeLoad = (tabId) => {
    const iframe = frameRefs.current[tabId];
    if (iframe) {
      try {
        // Get the current URL from the iframe
        const iframeUrl = iframe.contentWindow.location.href;
        
        // Send navigation message to parent
        window.parent.postMessage({
          type: 'NAVIGATION',
          url: iframeUrl
        }, '*');
        
        // Update tab title from iframe document title
        const title = iframe.contentWindow.document.title || 'New Tab';
        updateTabTitle(tabId, title);
      } catch (e) {
        console.log('Cannot access iframe content:', e);
      }
    }
  };

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      // Remove message event listeners for all iframes
      Object.values(frameRefs.current).forEach(frame => {
        if (frame && frame._messageHandler) {
          window.removeEventListener('message', frame._messageHandler);
          delete frame._messageHandler;
        }
      });
    };
  }, []);

  // Function to create new tab
  const createNewTab = () => {
    const newTabId = nextTabId;
    
    setTabs(prevTabs => [
      ...prevTabs.map(tab => ({ ...tab, active: false })),
      { id: newTabId, title: 'New Tab', url: pathname, active: true }
    ]);
    
    setActiveTabId(newTabId);
    setNextTabId(newTabId + 1);
  };

  // Function to switch tabs
  const switchTab = (tabId) => {
    if (tabId === activeTabId) return;
    
    setTabs(prevTabs => 
      prevTabs.map(tab => ({
        ...tab,
        active: tab.id === tabId
      }))
    );
    
    setActiveTabId(tabId);
    
    // Update browser URL to reflect active tab (without navigating to it)
    const newActiveTab = tabs.find(tab => tab.id === tabId);
    if (newActiveTab && typeof window !== 'undefined') {
      window.history.pushState(null, '', newActiveTab.url);
    }
  };

  // Function to close tab
  const closeTab = (e, tabId) => {
    e.stopPropagation();
    
    // Don't close if it's the last tab
    if (tabs.length === 1) return;
    
    // Find index of tab to close
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    
    // Clean up event listeners
    const frame = frameRefs.current[tabId];
    if (frame && frame._messageHandler) {
      window.removeEventListener('message', frame._messageHandler);
    }
    
    // Determine which tab to activate next
    let newActiveTabId;
    if (tabId === activeTabId) {
      // Prefer the tab to the left, otherwise the one to the right
      const newActiveTabIndex = Math.max(0, tabIndex - 1);
      newActiveTabId = tabs[newActiveTabIndex === tabIndex ? Math.min(tabs.length - 1, tabIndex + 1) : newActiveTabIndex].id;
    } else {
      newActiveTabId = activeTabId;
    }
    
    // Remove the tab and update active state
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      return newTabs.map(tab => ({
        ...tab,
        active: tab.id === newActiveTabId
      }));
    });
    
    setActiveTabId(newActiveTabId);
    
    // Update browser URL if we're closing the active tab
    if (tabId === activeTabId) {
      const newActiveTab = tabs.find(tab => tab.id === newActiveTabId);
      if (newActiveTab && typeof window !== 'undefined') {
        window.history.pushState(null, '', newActiveTab.url);
      }
    }
    
    // Clean up the iframe reference
    delete frameRefs.current[tabId];
  };

  return (
    <div className={styles.tabSystem}>
      <div className={styles.tabBar}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`${styles.tab} ${tab.active ? styles.activeTab : ''}`}
            onClick={() => switchTab(tab.id)}
          >
            <div className={styles.tabContent}>
              <span className={styles.tabTitle}>{tab.title}</span>
              <button
                className={styles.closeButton}
                onClick={(e) => closeTab(e, tab.id)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        ))}
        <button className={styles.newTabButton} onClick={createNewTab}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
      <div className={styles.tabContentContainer}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`${styles.tabPanel} ${tab.active ? styles.activePanel : ''}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: tab.active ? 'block' : 'none',
              visibility: tab.active ? 'visible' : 'hidden'
            }}
          >
            <iframe
              ref={el => { if (el) frameRefs.current[tab.id] = el; }}
              src={getFrameUrl(tab.url)}
              style={{
                border: 'none',
                width: '100%',
                height: '100%',
                display: 'block'
              }}
              data-active={tab.active}
              onLoad={() => handleIframeLoad(tab.id)}
              title={`Tab ${tab.id}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentIframeTabSystem;