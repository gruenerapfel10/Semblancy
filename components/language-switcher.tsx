"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage, UI_LANGUAGES, UILanguage } from "@/lib/context/language-context";
import { useTranslation } from "@/lib/i18n/hooks";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  const languages = [
    { 
      value: UI_LANGUAGES.ENGLISH, 
      label: t('languages.english'), 
      flag: '🇬🇧',
      description: 'International English'
    },
    { 
      value: UI_LANGUAGES.GERMAN, 
      label: t('languages.german'), 
      flag: '🇩🇪',
      description: 'Deutsch'
    },
    { 
      value: UI_LANGUAGES.FRENCH, 
      label: t('languages.french'), 
      flag: '🇫🇷',
      description: 'Français'
    },
  ];
  
  // Handle language change
  const handleLanguageChange = React.useCallback((value: UILanguage) => {
    console.log("Setting language to:", value);
    setLanguage(value);
    setOpen(false);
  }, [setLanguage]);

  const currentLanguage = languages.find(lang => lang.value === language);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a language"
          className="w-full justify-between group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:px-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:gap-0">
            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="group-data-[collapsible=icon]:hidden">{currentLanguage?.label}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 group-data-[collapsible=icon]:hidden" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup>
            {languages.map((lang) => (
              <CommandItem
                key={lang.value}
                onSelect={() => handleLanguageChange(lang.value)}
                className="text-sm cursor-pointer py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50">
                    <span className="text-lg">{lang.flag}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{lang.label}</span>
                    <span className="text-xs text-muted-foreground">{lang.description}</span>
                  </div>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    language === lang.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 