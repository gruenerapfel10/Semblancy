"use client"

import * as React from "react"
import { Check, ChevronsUpDown, GraduationCap, BookOpen, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useExam } from "@/lib/context/user-preferences-context"
import { EXAM_TYPES, EXAM_LANGUAGES, ExamType } from "@/lib/exam/config"
import { useTranslation } from "@/lib/i18n/hooks"

export function ExamSwitcher() {
  const { examType, setExamType } = useExam()
  const [open, setOpen] = React.useState(false)
  const { t } = useTranslation()

  const exams = [
    {
      name: "Goethe-Zertifikat",
      value: EXAM_TYPES.GOETHE,
      logo: EXAM_LANGUAGES[EXAM_TYPES.GOETHE].flag,
      description: "German Language Proficiency",
      level: "A1-C2",
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      name: "IELTS Academic",
      value: EXAM_TYPES.IELTS,
      logo: EXAM_LANGUAGES[EXAM_TYPES.IELTS].flag,
      description: "International English Testing",
      level: "Band 1-9",
      icon: <Award className="h-4 w-4" />
    }
  ]
  
  const handleExamChange = React.useCallback((value: ExamType) => {
    console.log("Setting exam type to:", value)
    setExamType(value)
    setOpen(false)
  }, [setExamType])

  const currentExam = exams.find(exam => exam.value === examType)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select an exam"
          className="w-full justify-between group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:px-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 border-orange-200 dark:border-orange-800 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900/50 dark:hover:to-amber-900/50"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:gap-0">
            <GraduationCap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="group-data-[collapsible=icon]:hidden">{currentExam?.name}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 group-data-[collapsible=icon]:hidden" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search exam..." />
          <CommandEmpty>No exam found.</CommandEmpty>
          <CommandGroup>
            {exams.map((exam) => (
              <CommandItem
                key={exam.value}
                onSelect={() => handleExamChange(exam.value as ExamType)}
                className="text-sm cursor-pointer py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50">
                    <span className="text-xl">{exam.logo}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{exam.name}</span>
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">
                        {exam.level}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{exam.description}</span>
                  </div>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    examType === exam.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
