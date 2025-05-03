import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FlashcardLibrary } from './types';
import { MoreHorizontal, Pencil, Trash2, Plus, ChevronRight, FolderPlus, GripVertical, ChevronLeft, PanelLeftClose, PanelLeft, Folder, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFlashcards } from './FlashcardContext';
import { StudySessionResult } from './FlashcardContext';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from '@/hooks/use-media-query';
import { getLibraryRetention, getUrgencyColor, UrgencyLevel } from '../utils/forgettingCurve';

interface LibraryGroup {
  id: string;
  name: string;
  libraries: string[]; // Library IDs
}

interface FlashcardSidebarProps {
  libraries: FlashcardLibrary[];
  selectedLibraryId: string | null;
  onSelectLibrary: (id: string) => void;
}

// Cookie name to save the sidebar state
const SIDEBAR_COOKIE_NAME = "flashcard_sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SIDEBAR_WIDTH = "260px";
const SIDEBAR_WIDTH_COLLAPSE = "56px";
const SIDEBAR_KEYBOARD_SHORTCUT = "s";

function LibraryItem({ 
  library, 
  isSelected, 
  isCollapsed,
  onClick, 
  onEdit, 
  onDelete,
  draggable = true,
  groupId,
  studySessions
}: { 
  library: FlashcardLibrary; 
  isSelected: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  draggable?: boolean;
  groupId?: string;
  studySessions: StudySessionResult[]; // Updated type
}) {
  // Get memory retention data from forgetting curve
  const librarySessions = studySessions.filter(session => session.libraryId === library.id);
  const retentionData = getLibraryRetention(library.id, studySessions);
  const urgencyColor = getUrgencyColor(retentionData.urgencyLevel);
  
  // Console log for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Library ${library.name} (${library.id}):`);
    console.log(`- Sessions count: ${librarySessions.length}`);
    if (librarySessions.length > 0) {
      console.log(`- Last session: ${new Date(librarySessions[0].startTime).toLocaleString()}`);
      console.log(`- Retention: ${retentionData.retention.toFixed(2)}%`);
      console.log(`- Urgency: ${UrgencyLevel[retentionData.urgencyLevel]}`);
      console.log(`- Days since last study: ${retentionData.daysSinceLastStudy.toFixed(1)}`);
    }
  }
  
  // Format retention percentage and days info
  const retentionPercent = Math.round(retentionData.retention);
  const daysText = retentionData.daysSinceLastStudy === Infinity 
    ? "Never studied" 
    : `${Math.round(retentionData.daysSinceLastStudy)} days ago`;
  
  const handleDragStart = draggable ? (e: React.DragEvent) => {
    e.dataTransfer.setData('libraryId', library.id);
    if (groupId) {
      e.dataTransfer.setData('sourceGroupId', groupId);
    } else {
      e.dataTransfer.setData('fromUngrouped', 'true');
    }
  } : undefined;

  // Collapsed view
  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isSelected ? "default" : "ghost"}
              size="icon"
              className={cn(
                "w-10 h-10 rounded-md transition-all duration-150 my-1",
                "hover:bg-muted hover:scale-105",
                isSelected && "bg-primary/20 shadow-inner shadow-primary/30",
                retentionData.urgencyLevel !== UrgencyLevel.NONE && !isSelected && urgencyColor
              )}
              onClick={onClick}
            >
              <Badge 
                variant="secondary" 
                className={cn(
                  "h-6 w-6 text-xs flex items-center justify-center",
                  isSelected && "bg-primary/30 text-primary-foreground border border-primary/50",
                  retentionData.urgencyLevel !== UrgencyLevel.NONE && !isSelected && 
                  {
                    'border-amber-500/50': retentionData.urgencyLevel === UrgencyLevel.CRITICAL,
                    'border-blue-500/40': retentionData.urgencyLevel === UrgencyLevel.HIGH,
                    'border-emerald-500/30': retentionData.urgencyLevel === UrgencyLevel.MEDIUM,
                    'border-slate-400/25': retentionData.urgencyLevel === UrgencyLevel.LOW
                  }
                )}
              >
                {library.cards.length}
              </Badge>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col">
            <span className="font-medium">{library.name}</span>
            <span className="text-xs text-muted-foreground">{library.cards.length} cards</span>
            {retentionData.urgencyLevel !== UrgencyLevel.NONE && (
              <div className="mt-1 text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className={cn(
                  retentionData.urgencyLevel === UrgencyLevel.CRITICAL && "text-amber-500",
                  retentionData.urgencyLevel === UrgencyLevel.HIGH && "text-blue-500",
                  retentionData.urgencyLevel === UrgencyLevel.MEDIUM && "text-emerald-500",
                  retentionData.urgencyLevel === UrgencyLevel.LOW && "text-slate-400"
                )}>
                  {retentionPercent}% retention ({daysText})
                </span>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Expanded view
  return (
    <div 
      className="relative group"
      draggable={Boolean(handleDragStart)}
      onDragStart={handleDragStart}
    >
      <Button
        variant={isSelected ? "default" : "ghost"}
        className={cn(
          "w-full justify-between pr-2 transition-all duration-150",
          "hover:translate-x-1 hover:-translate-y-[1px]",
          "active:translate-x-0 active:translate-y-0",
          isSelected 
            ? "shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 bg-gradient-to-r from-primary/10 to-transparent" 
            : retentionData.urgencyLevel !== UrgencyLevel.NONE
              ? urgencyColor
              : "hover:bg-muted/80",
          "rounded-none" // Remove button rounding to make border look better
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          {draggable && (
            <div className="cursor-grab p-1 hover:bg-muted/30 rounded-md">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          
          <Badge 
            variant="secondary" 
            className={cn(
              "shrink-0 transition-all duration-150",
              "group-hover:scale-110 group-hover:-rotate-3",
              "group-hover:shadow-sm group-hover:shadow-primary/20",
              isSelected && "bg-primary/30 text-primary-foreground border border-primary/50",
              retentionData.urgencyLevel !== UrgencyLevel.NONE && !isSelected && 
              {
                'border-amber-500/50': retentionData.urgencyLevel === UrgencyLevel.CRITICAL,
                'border-blue-500/40': retentionData.urgencyLevel === UrgencyLevel.HIGH,
                'border-emerald-500/30': retentionData.urgencyLevel === UrgencyLevel.MEDIUM,
                'border-slate-400/25': retentionData.urgencyLevel === UrgencyLevel.LOW
              }
            )}
          >
            {library.cards.length}
          </Badge>
          <div className="truncate mr-2 transition-transform duration-150 group-hover:translate-x-1">
            {library.name}
            {retentionData.urgencyLevel !== UrgencyLevel.NONE && (
              <div className="text-xs flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" />
                <span className={cn(
                  retentionData.urgencyLevel === UrgencyLevel.CRITICAL && "text-amber-500",
                  retentionData.urgencyLevel === UrgencyLevel.HIGH && "text-blue-500",
                  retentionData.urgencyLevel === UrgencyLevel.MEDIUM && "text-emerald-500",
                  retentionData.urgencyLevel === UrgencyLevel.LOW && "text-slate-400"
                )}>
                  {retentionPercent}% retention
                </span>
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="h-8 w-8 p-0 flex items-center justify-center rounded-full 
              transition-all duration-150 hover:bg-primary/10 hover:scale-110 active:scale-95">
              <MoreHorizontal className="h-4 w-4 transition-transform duration-150 
                group-hover:scale-110 group-hover:rotate-180" />
              <span className="sr-only">More</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-[160px] animate-in zoom-in-95 duration-100"
          >
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="transition-colors duration-150 hover:bg-primary/10 focus:bg-primary/10
                group/item"
            >
              <Pencil className="mr-2 h-4 w-4 transition-all duration-150 
                group-hover/item:scale-110 group-hover/item:rotate-12" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive 
                transition-colors duration-150 hover:bg-destructive/10
                group/delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4 transition-all duration-150 
                group-hover/delete:scale-110 group-hover/delete:rotate-12" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Button>
    </div>
  );
}

const FlashcardSidebar: React.FC<FlashcardSidebarProps> = ({
  libraries,
  selectedLibraryId,
  onSelectLibrary,
}) => {
  const { openLibraryDialog, openDeleteDialog, manager, groups, ungroupedLibraryObjects, handleSaveGroup, studySessions } = useFlashcards();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Group dialog state
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<{id: string, name: string} | null>(null);
  const [groupName, setGroupName] = useState('');

  // Sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const cookie = cookies.find(c => c.trim().startsWith(`${SIDEBAR_COOKIE_NAME}=`));
      return cookie ? cookie.split('=')[1] === 'true' : false;
    }
    return false;
  });

  // Toggle sidebar collapsed state
  const toggleSidebar = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    // Save state to cookie (only in browser)
    if (typeof document !== 'undefined') {
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${newState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }
  }, [isCollapsed]);

  // Keyboard shortcut
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Handle creating or editing a group
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setGroupName('New Group');
    setIsGroupDialogOpen(true);
  };
  
  const handleEditGroup = (group: {id: string, name: string}) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setIsGroupDialogOpen(true);
  };
  
  const handleSaveGroupDialog = () => {
    if (!groupName.trim()) return;
    
    handleSaveGroup(editingGroup?.id || null, groupName);
    
    setIsGroupDialogOpen(false);
    setGroupName('');
    setEditingGroup(null);
  };
  
  const handleDeleteGroup = (groupId: string) => {
    openDeleteDialog('group', { id: groupId });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetGroupId?: string) => {
    e.preventDefault();
    
    const libraryId = e.dataTransfer.getData('libraryId');
    const sourceGroupId = e.dataTransfer.getData('sourceGroupId');
    const fromUngrouped = e.dataTransfer.getData('fromUngrouped') === 'true';
    
    // Skip if dropping in same place
    if (sourceGroupId === targetGroupId) return;
    if (fromUngrouped && !targetGroupId) return;
    
    manager.moveLibrary(libraryId, targetGroupId, sourceGroupId);
  };

  return (
    <div
      className="group/sidebar flex h-full relative"
      data-collapsed={isCollapsed}
      style={
        {
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-collapsed": SIDEBAR_WIDTH_COLLAPSE,
        } as React.CSSProperties
      }
    >
      <div 
        className={cn(
          "h-full border-r bg-gradient-to-b from-muted/30 to-muted/10",
          "transition-all duration-300 ease-in-out",
          "data-[collapsed=false]:w-[var(--sidebar-width)]",
          "data-[collapsed=true]:w-[var(--sidebar-width-collapsed)]"
        )}
      >
        <div className="p-3 flex flex-col h-full">
          <div className={isCollapsed ? "" : "flex items-center justify-between mb-2"}>
            {
              !isCollapsed && (
                <h2 
                  className={cn(
                    "text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 transition-opacity duration-200",
                    isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
                  )}
                >
                  Libraries
                </h2>
              )
            }
            
            <div className="flex justify-center gap-2">
              {!isCollapsed && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleCreateGroup}
                    className="transition-all duration-200 hover:bg-muted group"
                  >
                    <FolderPlus className="w-4 h-4 mr-1 text-primary/70 transition-transform duration-200 group-hover:scale-110" />
                    Group
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => openLibraryDialog(null)}
                    className="relative overflow-hidden transition-all duration-200 
                      hover:scale-105 active:scale-90 hover:shadow-md hover:shadow-primary/20
                      bg-gradient-to-r from-primary to-primary/80 hover:to-primary group"
                  >
                    <Plus className="w-4 h-4 mr-1 transition-transform duration-200 group-hover:rotate-90" />
                    New
                    <span className="absolute inset-0 w-full h-full bg-white/20 transition-transform duration-200 
                      translate-x-[-100%] group-hover:translate-x-[100%] group-hover:opacity-50" />
                  </Button>
                </>
              )}
              
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted/80 transition-all duration-200"
                      onClick={toggleSidebar}
                    >
                      {isCollapsed ? (
                        <PanelLeft className="h-4 w-4" />
                      ) : (
                        <PanelLeftClose className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    <div className="text-xs text-muted-foreground mt-1">
                      Shortcut: ⌘/Ctrl+{SIDEBAR_KEYBOARD_SHORTCUT}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {!isCollapsed && (
            <Separator className="mb-3 bg-gradient-to-r from-primary/20 to-transparent" />
          )}
          
          <ScrollArea className="flex-1 -mx-2 px-2" type="hover">
            <div className="space-y-2 py-1">
              {/* GROUPS */}
              {groups.map((group) => {
                const groupLibraries = manager.getGroupLibraries(group.id);
                const isActive = selectedLibraryId ? group.libraries.includes(selectedLibraryId) : false;
                
                if (isCollapsed) {
                  return (
                    <TooltipProvider key={group.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "w-10 h-10 flex justify-center items-center rounded-md transition-all duration-150",
                              "my-3"
                            )}
                          >
                            <Folder className="h-5 w-5 text-primary/70" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex flex-col gap-1">
                          <span className="font-medium">{group.name}</span>
                          <span className="text-xs text-muted-foreground">{groupLibraries.length} libraries</span>
                          <div className="max-h-[200px] overflow-y-auto">
                            {groupLibraries.map(lib => (
                              <div key={lib.id} className="flex items-center gap-2 mt-1 text-xs">
                                <span className="h-2 w-2 rounded-full bg-primary/40"></span>
                                <span>{lib.name}</span>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }
                
                return (
                  <Collapsible
                    key={group.id}
                    defaultOpen={isActive}
                    className="group/collapsible border border-transparent hover:border-muted/30 rounded-lg overflow-hidden transition-all duration-200"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, group.id)}
                  >
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost"
                          className="flex-1 justify-start p-2 mb-0.5 hover:bg-muted/50 group-data-[state=open]/collapsible:bg-muted/20"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-primary/70">
                              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </span>
                            <span className="font-medium">{group.name}</span>
                            <Badge 
                              variant="outline" 
                              className="bg-muted/50 text-xs"
                            >
                              {groupLibraries.length}
                            </Badge>
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 p-0 hover:bg-muted mr-2"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => handleEditGroup(group)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit Group</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Group</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CollapsibleContent className="pl-3 pr-1 pb-1">
                      <div className="space-y-1">
                        {groupLibraries.map((library) => (
                          <LibraryItem
                            key={library.id}
                            library={library}
                            isSelected={selectedLibraryId === library.id}
                            isCollapsed={isCollapsed}
                            onClick={() => onSelectLibrary(library.id)}
                            onEdit={() => openLibraryDialog(library)}
                            onDelete={() => openDeleteDialog('library', library)}
                            groupId={group.id}
                            studySessions={studySessions}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
              
              {/* UNGROUPED LIBRARIES */}
              {ungroupedLibraryObjects.length > 0 && (
                <>
                  {isCollapsed ? (
                    <div className="space-y-1 py-2 mt-2 border-t border-muted/20 flex flex-col gap-2">
                      {ungroupedLibraryObjects.map((library) => (
                        <LibraryItem
                          key={library.id}
                          library={library}
                          isSelected={selectedLibraryId === library.id}
                          isCollapsed={isCollapsed}
                          onClick={() => onSelectLibrary(library.id)}
                          onEdit={() => openLibraryDialog(library)}
                          onDelete={() => openDeleteDialog('library', library)}
                          draggable={false}
                          studySessions={studySessions}
                        />
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="mb-2 border border-transparent hover:border-muted/30 rounded-lg p-2"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e)}
                    >
                      <div className="flex items-center mb-2 px-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Ungrouped</h3>
                        <Separator className="ml-3 flex-1" />
                      </div>
                      
                      <div className="space-y-1">
                        {ungroupedLibraryObjects.map((library) => (
                          <LibraryItem
                            key={library.id}
                            library={library}
                            isSelected={selectedLibraryId === library.id}
                            isCollapsed={isCollapsed}
                            onClick={() => onSelectLibrary(library.id)}
                            onEdit={() => openLibraryDialog(library)}
                            onDelete={() => openDeleteDialog('library', library)}
                            studySessions={studySessions}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
          
          {isCollapsed && !isMobile && (
            <div className="mt-4 flex justify-center pb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline" 
                      className="h-8 w-8 rounded-full hover:bg-muted/80"
                      onClick={() => openLibraryDialog(null)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Create new library
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
      
      {/* Group Creation/Editing Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'Edit Group' : 'Create Group'}</DialogTitle>
            <DialogDescription>
              {editingGroup 
                ? 'Update the name of this library group.'
                : 'Create a new group to organize your libraries.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGroupDialog} disabled={!groupName.trim()}>
              {editingGroup ? 'Save Changes' : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashcardSidebar; 