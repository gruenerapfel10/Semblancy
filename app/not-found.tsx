"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileQuestion, Home, ArrowLeft, Search, Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  const router = useRouter();

  // Popular pages that users might want to visit instead
  const popularPages = [
    { name: "Dashboard", path: "/dashboard/overview", icon: Home },
    { name: "Flashcards", path: "/dashboard/flashcards", icon: FileQuestion },
    { name: "Study Center", path: "/dashboard/skills", icon: Compass },
  ];

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg px-4"
      >
        <Card className="border-border/40 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 rounded-full bg-muted w-16 h-16 flex items-center justify-center">
              <FileQuestion className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Page Not Found</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="py-4">
              <div className="text-sm font-medium mb-3">You might want to check out:</div>
              <div className="flex flex-col gap-2">
                {popularPages.map((page) => (
                  <Link 
                    href={page.path} 
                    key={page.path}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 h-10"
                    >
                      <page.icon className="h-4 w-4" />
                      {page.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="pt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Search className="h-3 w-3" />
              <span>Tip: Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘K</kbd> to search for any page</span>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="ghost"
              onClick={() => router.back()}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            
            <Button asChild>
              <Link href="/dashboard/overview">
                Go to Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 