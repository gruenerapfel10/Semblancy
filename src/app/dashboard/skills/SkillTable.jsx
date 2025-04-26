import SkillCard from './SkillCard';

export default function SkillTable({ skills, onRowClick }) {
  return (
    <div className="rounded-lg border border-neutral-300/50 dark:border-neutral-700/50 bg-background shadow-md overflow-hidden relative animate-fade-in flex flex-col h-full">
      {/* Header - Use more visible neutral colors */}
      <div className="flex items-center px-4 py-2 bg-muted border-b border-neutral-300/50 dark:border-neutral-700/50 text-xs font-medium text-muted-foreground flex-shrink-0">
        <div className="flex-shrink-0 w-5 mr-3 text-center"></div> {/* Status placeholder */}
        <div className="flex-shrink-0 w-7 h-7 mr-3"></div> {/* Category Icon placeholder */}
        <div className="flex-grow min-w-0 mr-4">Skill</div>
        <div className="flex-shrink-0 w-28 text-right">Exam Boards</div>
      </div>
      
      {/* Skills list - Using theme backgrounds */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        {skills.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground animate-fade-in bg-background h-full flex items-center justify-center">
            No skills found matching your filters.
          </div>
        ) : (
          <div className="h-full">
            {skills.map((skill, idx) => (
              // Apply CSS animation with staggered delay
              <div 
                key={skill.id}
                className="animate-slide-up"
                style={{ animationDelay: `${idx * 25}ms`, animationDuration: '350ms' }}
              >
                {/* Pass zebra prop for alternating background */}
                <SkillCard 
                  skill={skill} 
                  onClick={() => onRowClick(skill)} 
                  zebra={idx % 2 !== 0} // Use bg-background for odd rows (index 1, 3, ...)
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 