"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 w-full border-b bg-background z-50">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex h-14 items-center w-full">
          <Button variant="ghost" className="hover:bg-transparent mr-4" asChild>
            <a href="/">
              <Logo size="medium" showTagline={false} invert={false} />
            </a>
          </Button>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 w-[400px]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Welcome
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Get started with our platform and explore all features.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/features" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Core Features</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Explore our platform&apos;s main capabilities
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/advanced" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Advanced Tools</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Discover our advanced features and tools
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <nav className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <a href="/login">Log in</a>
              </Button>
              <Button variant="default" asChild>
                <a href="/signup">Sign up</a>
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <div className="flex flex-col p-4 space-y-4 mx-auto max-w-[1400px] px-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Getting Started</p>
              <a href="/" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors">
                Welcome
              </a>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Features</p>
              <a href="/features" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors">
                Core Features
              </a>
              <a href="/advanced" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors">
                Advanced Tools
              </a>
            </div>
            
            <div className="pt-3 border-t flex flex-col space-y-2">
              <Button variant="outline" asChild className="w-full">
                <a href="/login">Log in</a>
              </Button>
              <Button variant="default" asChild className="w-full">
                <a href="/signup">Sign up</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 