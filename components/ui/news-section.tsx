"use client"

import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NewsItem {
  id: string
  category: string
  title: string
  description: string
  date: string
  image: string
  authorName: string
  authorRole?: string
  authorImage?: string
  href: string
}

interface NewsProps {
  title?: string
  viewAllLink?: string
  viewAllText?: string
  items: NewsItem[]
}

export function NewsSection({
  title = "Neueste Updates",
  viewAllLink = "/updates",
  viewAllText = "ALLE UPDATES",
  items = [],
}: NewsProps) {
  return (
    <section className="py-16">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-foreground">{title}</h2>
          <Link 
            href={viewAllLink}
            className="bg-muted hover:bg-muted/80 transition-colors py-2 px-4 rounded-md text-sm font-medium text-foreground"
          >
            {viewAllText}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link 
              key={item.id} 
              href={item.href}
              className="group block overflow-hidden rounded-lg transition-all hover:-translate-y-1 hover:shadow-xl bg-card border border-border"
            >
              <div className="relative">
                {/* Category badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-background py-1 px-2 text-xs font-semibold uppercase rounded text-foreground">
                    {item.category}
                  </span>
                </div>
                
                {/* Image */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                
                {/* Content */}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold mb-2 text-card-foreground">{item.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {item.authorImage ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={item.authorImage} alt={item.authorName} />
                          <AvatarFallback>{item.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{item.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.authorName}</p>
                        {item.authorRole && <p className="text-xs text-muted-foreground">{item.authorRole}</p>}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
} 