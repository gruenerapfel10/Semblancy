'use client';

import { useEffect, useRef } from "react";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import { DEBUG_CONFIG } from "../utils/forgettingCurve";
import { globalTabTrap } from "../../../../lib/latex/cursor-manager";

export function DebugControls() {
  const containerRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLButtonElement>(null);
  
  // Register with global tab trap on mount
  useEffect(() => {
    // Register elements with the tab trap
    if (containerRef.current) {
      globalTabTrap.registerElement(containerRef.current, 10); // Low priority, last in tab order
    }
    
    if (switchRef.current) {
      globalTabTrap.registerElement(switchRef.current, 10);
    }
    
    return () => {
      // Unregister when unmounted
      if (containerRef.current) {
        globalTabTrap.unregisterElement(containerRef.current);
      }
      
      if (switchRef.current) {
        globalTabTrap.unregisterElement(switchRef.current);
      }
    };
  }, []);
  
  const toggleDebugMode = () => {
    DEBUG_CONFIG.isEnabled = !DEBUG_CONFIG.isEnabled;
    // Force a re-render of the app
    window.location.reload();
  };

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Switch
            ref={switchRef}
            id="debug-mode"
            checked={DEBUG_CONFIG.isEnabled}
            onCheckedChange={toggleDebugMode}
          />
          <Label htmlFor="debug-mode">
            Debug Mode ({DEBUG_CONFIG.timeAcceleration}x Time Acceleration)
          </Label>
        </div>
        
        {DEBUG_CONFIG.isEnabled && (
          <div className="text-xs text-muted-foreground">
            Memory decay is accelerated by {DEBUG_CONFIG.timeAcceleration}x for testing
          </div>
        )}
      </div>
    </div>
  );
} 