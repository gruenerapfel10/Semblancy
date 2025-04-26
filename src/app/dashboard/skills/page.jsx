// app/dashboard/skills/page.js
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faSearch,
  faTimes,
  faBars,       // Keep for potential future grid view
  faListUl,     // Keep for potential future list view
  faSlidersH,   // Keep for mobile filter trigger
  faFilter,     // Added for desktop filter trigger
  faCheck,      // Added for status filter
  faStar,       // Added for status filter
  faLock        // Added for status filter
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added for desktop filters
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"; // Added for mobile filters
import { SKILLS_DATA } from './data';
import SkillTable from './SkillTable';
// import FilterSection from './FilterSection'; // Removed
import CategoryTabs from './CategoryTabs';

export default function Skills() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [examBoard, setExamBoard] = useState("all");
  // const [viewMode, setViewMode] = useState("list"); // Removed for now, focus on list
  // const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false); // Replaced with Sheet state

  // Memoize filtered skills for performance
  const filteredSkills = useMemo(() => {
    return SKILLS_DATA.skills.filter((skill) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        skill.title.toLowerCase().includes(searchLower) || 
        skill.number.replace('.','').includes(searchLower);
      const matchesCategory = activeCategory === "all" || skill.category === activeCategory;
      const matchesStatus = activeStatus === "all" || skill.status === activeStatus;
      const matchesExamBoard = examBoard === "all" || 
        (skill.examBoard && skill.examBoard.some(board => 
          // Match based on ID now for consistency if data changes
          board.toLowerCase() === examBoard.toLowerCase() || SKILLS_DATA.examBoards.find(eb => eb.id === examBoard && eb.name === board)
        ));

      return matchesSearch && matchesCategory && matchesStatus && matchesExamBoard;
    });
  }, [searchTerm, activeCategory, activeStatus, examBoard]);

  // Memoize active filter count (excluding search term for badge display)
  const activeFilterCount = useMemo(() => {
    return [
      activeCategory !== "all",
      activeStatus !== "all",
      examBoard !== "all",
      // searchTerm !== "" // Exclude search term from badge count
    ].filter(Boolean).length;
  }, [activeCategory, activeStatus, examBoard]);
  
   // Count including search term for clear button logic
   const totalActiveFilterCount = useMemo(() => {
    return activeFilterCount + (searchTerm !== "" ? 1 : 0);
   }, [activeFilterCount, searchTerm]);

  // Navigation function - Updated to use ID-based routing
  const navigateToSkill = (skill) => {
    router.push(`/dashboard/skills/${skill.id}`);
  };

  // Clear all filters function
  const clearFilters = () => {
    setSearchTerm("");
    setActiveCategory("all");
    setActiveStatus("all");
    setExamBoard("all");
    // setMobileFiltersOpen(false); // Not needed with Sheet
  };

  // Common filter components for reuse between desktop dropdown and mobile sheet
  const StatusFilterButtons = ({ inSheet = false }) => (
    <div className={`flex flex-wrap gap-1.5 ${inSheet ? 'flex-col items-stretch' : ''}`}>
      <Button 
        variant={activeStatus === "all" ? "secondary" : "outline"} 
        size="sm" 
        className={`h-8 text-xs px-2.5 ${inSheet ? 'justify-start' : ''}`}
        onClick={() => setActiveStatus("all")}
      >
        All Status
      </Button>
      <Button 
        variant={activeStatus === "completed" ? "secondary" : "outline"} 
        size="sm" 
        className={`h-8 text-xs px-2.5 gap-1.5 ${inSheet ? 'justify-start' : ''}`}
        onClick={() => setActiveStatus("completed")}
      >
        <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-green-500" />
        Completed
      </Button>
      <Button 
        variant={activeStatus === "attempted" ? "secondary" : "outline"} 
        size="sm" 
        className={`h-8 text-xs px-2.5 gap-1.5 ${inSheet ? 'justify-start' : ''}`}
        onClick={() => setActiveStatus("attempted")}
      >
        <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-yellow-500" />
        Attempted
      </Button>
      <Button 
        variant={activeStatus === "locked" ? "secondary" : "outline"} 
        size="sm" 
        className={`h-8 text-xs px-2.5 gap-1.5 ${inSheet ? 'justify-start' : ''}`}
        onClick={() => setActiveStatus("locked")}
      >
        <FontAwesomeIcon icon={faLock} className="h-3 w-3 text-muted-foreground/80" />
        Locked
      </Button>
    </div>
  );

  const ExamBoardFilterSelect = () => (
     <Select value={examBoard} onValueChange={setExamBoard}>
        <SelectTrigger className="w-full h-9 text-sm">
          <SelectValue placeholder="Select Exam Board" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-sm">All Boards</SelectItem>
          {SKILLS_DATA.examBoards.map(board => (
            <SelectItem key={board.id} value={board.id} className="text-sm">
              {board.name} <span className="text-muted-foreground ml-1">({board.count})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
  );

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {/* Enhanced Background pattern with grid and gradient */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Base grid pattern - Increased opacity */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Dark mode grid pattern - Increased opacity */}
        <div className="absolute inset-0 dark:bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] dark:bg-[size:24px_24px]"></div>
        {/* Gradient overlay - Reduced opacity */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/30 to-background"></div>
      </div>
      
      {/* Header & Filters - Removed sticky positioning */}
      <header className="bg-background/95 backdrop-blur-md z-10">
        <div className="w-full px-4">
          {/* Top Row: Title, Search, Desktop Filters, Mobile Trigger */}
          <div className="flex items-center justify-between h-14">
            {/* Left Side: Title */}
            <div className="flex items-center gap-2 flex-shrink-0 mr-4">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-blue-400 dark:from-primary dark:to-blue-600 flex items-center justify-center text-primary-foreground">
                 <FontAwesomeIcon icon={faBookOpen} className="h-3.5 w-3.5" />
              </div>
              <h1 className="text-base font-semibold tracking-tight text-foreground whitespace-nowrap">
                Skills Dashboard
              </h1>
            </div>
            
            {/* Center: Search Bar (Desktop/Tablet) */}
            <div className="hidden sm:flex flex-grow max-w-xs md:max-w-sm lg:max-w-md items-center relative mx-4">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
              />
              <Input
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-sm w-full bg-muted/40 border rounded-md focus:bg-background"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                  aria-label="Clear search"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Right Side: Desktop Filters & Mobile Trigger */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Desktop Filter Dropdown */}
              <div className="hidden md:flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm">
                      <FontAwesomeIcon icon={faFilter} className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">Filters</span>
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 min-w-[1.25rem] p-0 flex items-center justify-center rounded-full text-xs">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="text-sm font-semibold">Filter By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <div className="px-2 py-1.5 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Status</p>
                        <StatusFilterButtons />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Exam Board</p>
                        <ExamBoardFilterSelect />
                      </div>
                    </div>
                    
                    {totalActiveFilterCount > 0 && ( // Use total count here
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={clearFilters} className="text-xs cursor-pointer justify-center text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50 focus:text-red-700 dark:focus:text-red-400">
                          Clear All Filters ({totalActiveFilterCount})
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Optional: View Mode Toggle could go here */}
              </div>

              {/* Mobile Filter Trigger (Sheet) */}
               <div className="md:hidden">
                 <Sheet>
                   <SheetTrigger asChild>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="h-9 w-9 text-muted-foreground relative"
                     >
                       <FontAwesomeIcon icon={faSlidersH} className="h-4 w-4" />
                       {totalActiveFilterCount > 0 && ( // Use total count here
                         <Badge variant="default" className="absolute -top-1 -right-1 h-4 w-4 min-w-[1rem] p-0 flex items-center justify-center rounded-full text-xs">
                           {totalActiveFilterCount}
                         </Badge>
                       )}
                       <span className="sr-only">Open Filters</span>
                     </Button>
                   </SheetTrigger>
                   <SheetContent side="bottom" className="flex flex-col max-h-[85vh]">
                      <SheetHeader className="border-b pb-3 mb-4">
                        <SheetTitle>Filter Skills</SheetTitle>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto px-1 space-y-5 pb-4">
                         {/* Mobile Search */}
                         <div className="relative">
                            <FontAwesomeIcon 
                              icon={faSearch} 
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                            />
                            <Input
                              placeholder="Search skills..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8 h-9 text-sm w-full bg-background border rounded-md"
                            />
                            {searchTerm && (
                              <button 
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                                aria-label="Clear search"
                              >
                                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          {/* Mobile Status */}
                           <div>
                             <p className="text-sm font-medium text-foreground mb-2">Status</p>
                             <StatusFilterButtons inSheet={true} />
                           </div>
                           {/* Mobile Exam Board */}
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Exam Board</p>
                              <ExamBoardFilterSelect />
                           </div>
                           {/* Mobile Category (Select for space saving) */}
                           <div>
                              <p className="text-sm font-medium text-foreground mb-2">Topic</p>
                              <Select value={activeCategory} onValueChange={setActiveCategory}>
                                <SelectTrigger className="w-full h-9 text-sm">
                                  <SelectValue placeholder="Select Topic" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all" className="text-sm">All Topics</SelectItem>
                                  {SKILLS_DATA.categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id} className="text-sm">
                                      {cat.name} <span className="text-muted-foreground ml-1">({cat.count})</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                           </div>
                      </div>
                       <SheetFooter className="border-t pt-4">
                         <SheetClose asChild>
                           <Button type="button" variant="secondary" className="flex-1">Done</Button>
                         </SheetClose>
                          <Button 
                            variant="outline" 
                            className="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-400 border-red-200 dark:border-red-800/50"
                            onClick={clearFilters}
                            disabled={totalActiveFilterCount === 0}
                          >
                            Clear Filters ({totalActiveFilterCount})
                          </Button>
                       </SheetFooter>
                   </SheetContent>
                 </Sheet>
               </div>
            </div>
          </div>

          {/* Bottom Row: Category Tabs (Desktop/Tablet Only) */}
          <div className="hidden sm:block">
            <CategoryTabs 
              categories={SKILLS_DATA.categories} 
              activeCategory={activeCategory} 
              setActiveCategory={setActiveCategory} 
            />
          </div>
        </div>
      </header>

      {/* Main content section - Added background pattern */}
      <main className="w-full px-4 py-4 sm:py-6 flex-1">
        {/* Background pattern for main container */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] dark:bg-[size:24px_24px] z-[0]"></div>
        
        {/* Results stats - Simple text, could be enhanced */}
        <div className="relative z-10 mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredSkills.length} result{filteredSkills.length !== 1 ? 's' : ''}
            {totalActiveFilterCount > 0 && ` (filtered from ${SKILLS_DATA.skills.length})`}
          </p>
        </div>
        
        {/* Skills List */}
        <div className="relative z-10"> 
          <SkillTable skills={filteredSkills} onRowClick={navigateToSkill} />
        </div>
        
        {/* No results message */}
        {filteredSkills.length === 0 && searchTerm === "" && totalActiveFilterCount > 0 && (
          <div className="relative z-10 bg-card border rounded-lg p-10 text-center mt-6 shadow-sm animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faFilter} className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1 text-foreground">No skills match filters</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              Try adjusting or clearing your filters to see more skills.
            </p>
            <Button onClick={clearFilters} size="sm" variant="secondary">
              Clear all filters ({totalActiveFilterCount})
            </Button>
          </div>
        )}
        {filteredSkills.length === 0 && searchTerm !== "" && (
          <div className="relative z-10 bg-card border rounded-lg p-10 text-center mt-6 shadow-sm animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1 text-foreground">No skills match "{searchTerm}"</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              Try a different search term or clear your filters.
            </p>
            <Button onClick={clearFilters} size="sm" variant="secondary">
              Clear Search & Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
