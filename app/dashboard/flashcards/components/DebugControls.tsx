'use client';

import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import { DEBUG_CONFIG } from "../utils/forgettingCurve";

export function DebugControls() {
  const toggleDebugMode = () => {
    DEBUG_CONFIG.isEnabled = !DEBUG_CONFIG.isEnabled;
    // Force a re-render of the app
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Switch
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