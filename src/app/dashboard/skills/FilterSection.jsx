import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faFilter,
  faCheck,
  faStar,
  faLock,
  faSlidersH
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
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";

export default function FilterSection({
  searchTerm,
  setSearchTerm,
  activeStatus,
  setActiveStatus,
  examBoard,
  setExamBoard,
  activeCategory, // Needed for mobile sheet select
  setActiveCategory, // Needed for mobile sheet select
  clearFilters,
  activeFilterCount, // Badge count (excluding search)
  totalActiveFilterCount, // Count including search (for clear buttons)
  examBoards,
  categories // Needed for mobile sheet select
}) {

  // Reusable filter components defined inside or passed as props if needed elsewhere
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
          {examBoards.map(board => (
            <SelectItem key={board.id} value={board.id} className="text-sm">
              {board.name} <span className="text-muted-foreground ml-1">({board.count})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
  );
  
  const CategoryFilterSelect = () => (
    <Select value={activeCategory} onValueChange={setActiveCategory}>
      <SelectTrigger className="w-full h-9 text-sm">
        <SelectValue placeholder="Select Topic" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="text-sm">All Topics</SelectItem>
        {categories.map(cat => (
          <SelectItem key={cat.id} value={cat.id} className="text-sm">
            {cat.name} <span className="text-muted-foreground ml-1">({cat.count})</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <>
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
              
              {totalActiveFilterCount > 0 && (
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
                 {totalActiveFilterCount > 0 && (
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
                     {/* Mobile Category */}
                     <div>
                        <p className="text-sm font-medium text-foreground mb-2">Topic</p>
                         <CategoryFilterSelect />
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
    </>
  );
} 