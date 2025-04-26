import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalculator,
  faFlask,
  faAtom,
  faSquareRootVariable,
  faLayerGroup
} from "@fortawesome/free-solid-svg-icons";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define category styles with gradients and colors
const getCategoryStyles = (category) => {
  switch(category) {
    case 'maths': return {
      icon: faCalculator,
      gradient: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-500 dark:bg-blue-500',
      hover: 'hover:bg-blue-600 dark:hover:bg-blue-600',
      active: 'data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-600'
    };
    case 'chemistry': return {
      icon: faFlask,
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-500 dark:bg-green-500',
      hover: 'hover:bg-green-600 dark:hover:bg-green-600',
      active: 'data-[state=active]:bg-green-600 dark:data-[state=active]:bg-green-600'
    };
    case 'physics': return {
      icon: faAtom,
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-500 dark:bg-purple-500',
      hover: 'hover:bg-purple-600 dark:hover:bg-purple-600',
      active: 'data-[state=active]:bg-purple-600 dark:data-[state=active]:bg-purple-600'
    };
    case 'further_maths': return {
      icon: faSquareRootVariable,
      gradient: 'from-orange-500 to-red-500',
      bg: 'bg-orange-500 dark:bg-orange-500',
      hover: 'hover:bg-orange-600 dark:hover:bg-orange-600',
      active: 'data-[state=active]:bg-orange-600 dark:data-[state=active]:bg-orange-600'
    };
    default: return {
      icon: faLayerGroup,
      gradient: 'from-slate-500 to-gray-500',
      bg: 'bg-slate-500/80 dark:bg-slate-500/80',
      hover: 'hover:bg-slate-600/80 dark:hover:bg-slate-600/80',
      active: 'data-[state=active]:bg-slate-600/80 dark:data-[state=active]:bg-slate-600/80'
    };
  }
};

export default function CategoryTabs({ categories, activeCategory, setActiveCategory }) {
  return (
    <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
      <TabsList className="h-auto min-h-[2.5rem] bg-transparent justify-start overflow-x-auto gap-1 no-scrollbar p-0">
        <div className="flex items-center gap-1 min-w-max">
          <TabsTrigger 
            value="all" 
            className="rounded-md px-3 py-1.5 h-auto text-sm font-medium text-white data-[state=inactive]:text-white/80 hover:text-white data-[state=inactive]:font-normal data-[state=active]:font-medium transition-colors bg-slate-500/80 dark:bg-slate-500/80 hover:bg-slate-600/80 dark:hover:bg-slate-600/80 data-[state=active]:bg-slate-600/80 dark:data-[state=active]:bg-slate-600/80"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faLayerGroup} className="h-3.5 w-3.5" />
              </div>
              <span>All Topics</span>
            </div>
          </TabsTrigger>
          {categories.map(category => {
            const { icon, gradient, bg, hover, active } = getCategoryStyles(category.id);
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className={`rounded-md px-3 py-1.5 h-auto text-sm font-medium text-white data-[state=inactive]:text-white/80 hover:text-white data-[state=inactive]:font-normal data-[state=active]:font-medium transition-colors ${bg} ${hover} ${active}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
                    <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
                  </div>
                  <span>{category.name}</span>
                  <Badge 
                    variant="outline" 
                    className="ml-1 px-1.5 py-0 text-xs font-normal border-neutral-200 dark:border-neutral-800"
                  >
                    {category.count}
                  </Badge>
                </div>
              </TabsTrigger>
            );
          })}
        </div>
      </TabsList>
    </Tabs>
  );
} 