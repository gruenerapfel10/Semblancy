'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface Team {
  id: string;
  name: string;
}

export function TeamSwitcher() {
  const [selectedTeam, setSelectedTeam] = useState<Team>({ id: '1', name: 'Personal' });

  const teams: Team[] = [
    { id: '1', name: 'Personal' },
    { id: '2', name: 'Team A' },
    { id: '3', name: 'Team B' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-between">
          {selectedTeam.name}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => setSelectedTeam(team)}
          >
            {team.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}