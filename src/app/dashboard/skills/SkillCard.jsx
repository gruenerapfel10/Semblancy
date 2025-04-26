import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faStar, faLock, faCalculator, faFlask, faAtom, faSquareRootVariable } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Refined category styles for a modern look
const getCategoryStyles = (category) => {
  switch(category) {
    case 'maths': return { icon: faCalculator, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-500/15" };
    case 'chemistry': return { icon: faFlask, color: "text-green-500 dark:text-green-400", bg: "bg-green-500/10 dark:bg-green-500/15" };
    case 'physics': return { icon: faAtom, color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-500/10 dark:bg-purple-500/15" };
    case 'further_maths': return { icon: faSquareRootVariable, color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500/10 dark:bg-orange-500/15" };
    default: return { icon: faCalculator, color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-500/10 dark:bg-slate-500/15" };
  }
};

// Refined status styles
const getStatusStyles = (status) => {
  switch(status) {
    case 'completed': return { icon: faCheck, color: "text-green-600 dark:text-green-400" };
    case 'attempted': return { icon: faStar, color: "text-yellow-500 dark:text-yellow-400" };
    default: return { icon: faLock, color: "text-muted-foreground/80" };
  }
};

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="flex items-center px-4 py-2.5">
      <div className="w-5 h-5 rounded-full bg-muted/50 mr-3"></div>
      <div className="w-7 h-7 rounded-md bg-muted/50 mr-3"></div>
      <div className="flex-grow">
        <div className="h-4 bg-muted/50 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted/50 rounded w-1/4"></div>
      </div>
      <div className="flex gap-1.5">
        <div className="w-16 h-5 bg-muted/50 rounded"></div>
        <div className="w-16 h-5 bg-muted/50 rounded"></div>
      </div>
    </div>
  </div>
);

export default function SkillCard({ skill, onClick, zebra, index = 0 }) {
  const { icon: statusIcon, color: statusColor } = getStatusStyles(skill.status);
  const { icon: categoryIcon, color: categoryColor, bg: categoryBg } = getCategoryStyles(skill.category);
  
  // Define base and zebra background classes using theme variables
  const baseBg = 'bg-background'; // Default row background
  const zebraBg = 'bg-muted'; // Alternating row background

  // Calculate staggered delay based on index
  const staggerDelay = index * 50; // 50ms delay between each card

  return (
    <div 
      className={cn(
        "group relative flex items-center px-4 py-2.5 cursor-pointer",
        "transition-all duration-200 ease-out",
        "hover:bg-muted/60",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        "before:opacity-0 before:transition-opacity before:duration-300",
        "hover:before:opacity-100",
        "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent",
        "after:opacity-0 after:transition-opacity after:duration-300 after:delay-150",
        "hover:after:opacity-100",
        zebra ? zebraBg : baseBg,
        "border-b border-border/30 last:border-b-0"
      )}
      style={{
        animationDelay: `${staggerDelay}ms`,
        animationDuration: '400ms',
        animationFillMode: 'both',
        animationName: 'slideIn'
      }}
      onClick={onClick}
    >
      {/* Status Icon - Subtle with hover effect */}
      <div className="flex-shrink-0 w-5 mr-3 flex justify-center">
        <FontAwesomeIcon 
          icon={statusIcon} 
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            "group-hover:scale-110",
            statusColor
          )} 
        />
      </div>
      
      {/* Category Icon - Themed Background with hover effect */}
      <div className={cn(
        "flex-shrink-0 w-7 h-7 mr-3 rounded-md flex items-center justify-center",
        "transition-all duration-200",
        "group-hover:scale-105",
        categoryBg
      )}>
         <FontAwesomeIcon 
           icon={categoryIcon} 
           className={cn(
             "h-4 w-4 transition-transform duration-200",
             "group-hover:scale-110",
             categoryColor
           )} 
         />
      </div>

      {/* Skill Title & Number - Compact with hover effect */}
      <div className="flex-grow flex items-baseline min-w-0 mr-4">
        <span className="font-medium text-sm text-foreground truncate mr-2 transition-colors duration-200 group-hover:text-foreground/90" title={skill.title}>
          {skill.title}
        </span>
        <span className="text-xs text-muted-foreground font-mono flex-shrink-0 transition-colors duration-200 group-hover:text-muted-foreground/90">
          #{skill.number.replace('.','')}
        </span>
      </div>
      
      {/* Exam Board Badges - Modern hover effects */}
      <div className="flex items-center gap-1.5 flex-shrink-0 w-28 justify-end">
        {skill.examBoard.slice(0, 2).map((board, idx) => (
          <Badge 
            key={idx} 
            variant="secondary"
            className={cn(
              "text-xs px-2 py-0.5 font-medium",
              "bg-background hover:bg-muted",
              "transition-all duration-200",
              "group-hover:translate-y-[-1px]",
              "shadow-sm hover:shadow-md",
              "border-0"
            )}
          >
            {board}
          </Badge>
        ))}
        {skill.examBoard.length > 2 && (
           <Badge 
            variant="secondary"
            className={cn(
              "text-xs px-2 py-0.5 font-medium",
              "bg-background hover:bg-muted",
              "transition-all duration-200",
              "group-hover:translate-y-[-1px]",
              "shadow-sm hover:shadow-md",
              "border-0"
            )}
          >
            +{skill.examBoard.length - 2}
          </Badge>
        )}
      </div>
    </div>
  );
}

// Add keyframes for slide-in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);