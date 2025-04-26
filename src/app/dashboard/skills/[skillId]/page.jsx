"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { SKILLS_DATA } from '../data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock, faStar, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { TabSystem } from '../components/TabSystem';
import type { LayoutNode } from '../components/TabSystem';

export default function SkillPage() {
  const params = useParams();
  const skillId = params.skillId;
  const skill = SKILLS_DATA.skills.find(s => s.id.toString() === skillId);

  // Initial tab system layout
  const [layout, setLayout] = useState<LayoutNode>({
    id: 'root_window',
    type: 'window',
    tabs: [
      { id: 'overview', title: 'Overview', iconType: 'bookOpen' },
      { id: 'topics', title: 'Topics', iconType: 'hash' },
      { id: 'practice', title: 'Practice', iconType: 'percent' },
      { id: 'help', title: 'Help', iconType: 'bot' }
    ],
    activeTabId: 'overview',
    isCollapsed: false
  });

  if (!skill) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-4">Skill not found</h1>
          <Link href="/dashboard/skills">
            <Button variant="outline" className="gap-2">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
              Back to Skills
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-green-500" />;
      case 'attempted':
        return <FontAwesomeIcon icon={faStar} className="h-4 w-4 text-yellow-500" />;
      default:
        return <FontAwesomeIcon icon={faLock} className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Content renderer for tabs
  const getContentForTab = (tabId: string) => {
    switch (tabId) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{skill.description}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Difficulty</h2>
              <Badge variant="outline" className="capitalize">
                {skill.difficulty}
              </Badge>
            </div>
          </div>
        );
      case 'topics':
        return (
          <div>
            <h2 className="text-lg font-semibold mb-3">Topics Covered</h2>
            <ul className="space-y-2">
              {skill.topics.map((topic, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                  <span className="text-muted-foreground">{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'practice':
        return (
          <div className="text-center py-12">
            <h2 className="text-lg font-semibold mb-2">Practice Questions Coming Soon</h2>
            <p className="text-muted-foreground">We're preparing interactive practice questions for this skill.</p>
          </div>
        );
      case 'help':
        return (
          <div className="text-center py-12">
            <h2 className="text-lg font-semibold mb-2">AI Assistant</h2>
            <p className="text-muted-foreground">Get help with this skill using our AI tutor.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/skills">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{skill.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
                </Badge>
                {skill.examBoard.map((board, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {board}
                  </Badge>
                ))}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {getStatusIcon(skill.status)}
                  <span className="capitalize">{skill.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with TabSystem */}
      <div className="max-w-6xl mx-auto px-6 py-6 h-[calc(100vh-8rem)]">
        <TabSystem
          layout={layout}
          onLayoutChange={setLayout}
          getContentForTab={getContentForTab}
        />
      </div>
    </div>
  );
} 