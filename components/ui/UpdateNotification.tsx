"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button, ButtonProps } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChangelogEntry } from "@/components/ui/changelog";
import { History, ChevronRight, Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Key used in localStorage to track the last viewed version
const LAST_VIEWED_VERSION_KEY = "semblancy-last-viewed-version";

interface UpdateNotificationProps {
  entries: ChangelogEntry[];
  showButton?: boolean;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  buttonProps?: Omit<ButtonProps, "onClick">;
  autoShowLatest?: boolean;
}

export function UpdateNotification({
  entries = [],
  showButton = true,
  buttonLabel = "Updates",
  buttonIcon = <History className="h-4 w-4 mr-2" />,
  buttonProps = {},
  autoShowLatest = true,
}: UpdateNotificationProps) {
  const [open, setOpen] = useState(false);
  const [lastViewedVersion, setLastViewedVersion] = useState<string | null>(null);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  
  // Get the latest entry
  const latestEntry = entries.length > 0 ? entries[0] : null;

  // Check if there are updates the user hasn't seen
  const hasNewUpdates = latestEntry && hasCheckedStorage && (!lastViewedVersion || 
    (latestEntry.version.split(" ")[1] > lastViewedVersion));

  // Check if there are new updates on component mount
  useEffect(() => {
    // Get last viewed version from localStorage
    if (typeof window !== 'undefined' && !hasCheckedStorage) {
      const savedLastViewedVersion = localStorage.getItem(LAST_VIEWED_VERSION_KEY);
      setLastViewedVersion(savedLastViewedVersion);
      setHasCheckedStorage(true);
    }
  }, [hasCheckedStorage]);

  // Effect to handle auto-showing updates, only after storage has been checked
  useEffect(() => {
    if (autoShowLatest && hasNewUpdates && hasCheckedStorage) {
      setOpen(true);
    }
  }, [autoShowLatest, hasNewUpdates, hasCheckedStorage]);

  // Handle closing the dialog and updating the last viewed version
  const handleClose = () => {
    if (latestEntry) {
      // Store the latest version in localStorage
      const latestVersion = latestEntry.version.split(" ")[1];
      localStorage.setItem(LAST_VIEWED_VERSION_KEY, latestVersion);
      setLastViewedVersion(latestVersion);
    }
    setOpen(false);
  };

  // If there are no entries, don't render
  if (entries.length === 0 || !latestEntry) return null;

  return (
    <>
      {/* Update Button */}
      {showButton && (
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          variant={hasNewUpdates ? "secondary" : "outline"}
          className={cn(
            "relative transition-all duration-300 hover:shadow-md",
            hasNewUpdates && "bg-primary/10 hover:bg-primary/20"
          )}
          {...buttonProps}
        >
          {hasNewUpdates ? <Bell className="h-4 w-4 mr-2 animate-pulse" /> : buttonIcon}
          {buttonLabel}
          {hasNewUpdates && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs 
                bg-gradient-to-br from-primary to-primary/80 text-primary-foreground 
                shadow-sm shadow-primary/20 animate-bounce"
            >
              !
            </Badge>
          )}
        </Button>
      )}

      {/* Single Changelog Entry Dialog */}
      <Dialog 
        open={open} 
        onOpenChange={(newOpen) => {
          if (!newOpen) handleClose();
          setOpen(newOpen);
        }}
      >
        <DialogContent className="p-0 border-0 overflow-hidden sm:max-w-[800px] bg-transparent shadow-none">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30
              }}
              className="bg-gradient-to-b from-background to-background/90 backdrop-blur-sm rounded-xl shadow-lg 
                border border-border/60 w-full relative overflow-hidden"
            >
              {/* Decorative top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
              
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <Badge className="text-xs px-3 py-1 rounded-full border 
                    bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    {latestEntry.version}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground tracking-wide">
                    {latestEntry.date}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold mb-2 leading-tight tracking-tight font-sans text-foreground">
                  {latestEntry.title}
                </h3>
                
                <p className="text-base text-muted-foreground mb-6 leading-relaxed font-sans">
                  {latestEntry.description}
                </p>
                
                <div className="md:grid md:grid-cols-5 md:gap-8">
                  {latestEntry.items && latestEntry.items.length > 0 && (
                    <div className="mb-6 md:mb-0 md:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="font-semibold text-base text-foreground tracking-wide font-sans">
                          What's included
                        </span>
                      </div>
                      <ol className="flex flex-col gap-3">
                        {latestEntry.items.map((item, i) => (
                          <motion.li 
                            key={i} 
                            className="flex items-start gap-3 group transition-all"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <div className="flex items-center justify-center min-w-6 h-6 mt-0.5 rounded-full 
                              bg-primary/10 text-primary font-medium text-sm border border-primary/20
                              group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                              {i + 1}
                            </div>
                            <span className="text-sm text-foreground font-sans leading-snug 
                              group-hover:text-primary/90 transition-colors">
                              {item}
                            </span>
                          </motion.li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {latestEntry.image && (
                    <div className="mt-2 md:mt-0 md:col-span-3">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="aspect-[16/9] w-full rounded-lg overflow-hidden shadow-md 
                          border border-border/50 bg-muted/30 relative group"
                      >
                        <img
                          src={latestEntry.image}
                          alt={`${latestEntry.title}`}
                          className="w-full h-full object-cover transition-transform duration-500 
                            group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-border/40 p-4 flex justify-end bg-muted/10">
                <Button 
                  onClick={handleClose} 
                  size="sm" 
                  variant="outline" 
                  className="mr-3 hover:bg-muted/70"
                >
                  Dismiss
                </Button>
                <Button 
                  onClick={handleClose} 
                  size="sm"
                  className="bg-primary hover:bg-primary/90 group"
                >
                  <span>Got it</span>
                  <CheckCheck className="ml-2 h-4 w-4 transition-transform duration-300 
                    group-hover:scale-110" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
} 