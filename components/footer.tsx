import Link from "next/link"
import { cn } from "@/lib/utils"

interface FooterProps {
  className?: string
}

export function SiteFooter({ className }: FooterProps) {
  return (
    <footer className={cn("w-full border-t py-12 md:py-16", className)}>
      <div className="container mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:gap-12">
          {/* Subjects Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">SUBJECTS</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Mathematics
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  English Literature
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Physics
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Chemistry
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Biology
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Computer Science
                </Link>
              </li>
            </ul>
          </div>

          {/* Products Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">PRODUCTS</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Study Assistant
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  AI Tutor
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Revision Studio
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Exam Prep
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  SemblancyStudios
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  SemblancyReader
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">SOLUTIONS</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:underline">
                  For Schools
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  For Teachers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  For Students
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  For Parents
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  For Tutors
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Exam Boards
                </Link>
              </li>
            </ul>
          </div>

          {/* Join As Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">JOIN AS</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Student
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Teacher
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Tutor
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  School Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">RESOURCES</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Study Guides
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Exam Timetables
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Webinars
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">COMPANY</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Safety
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Impact Program
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:underline">
                  Press Kit
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-semibold text-xl">
              Semblancy
            </Link>
            <div className="flex items-center gap-1 rounded border px-2 py-1 text-xs">
              <span>ENGLISH</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground md:text-left">
            Reach every student with AI-powered education
          </p>

          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-sm text-muted-foreground">© 2025 Semblancy</span>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
              <Link href="/safety" className="hover:underline">
                Safety
              </Link>
              <button className="hover:underline">Cookies</button>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded border border-green-500 bg-green-50 px-2 py-1 text-xs text-green-700">GDPR</span>
              <span className="rounded border border-blue-500 bg-blue-50 px-2 py-1 text-xs text-blue-700">DfE</span>
              <span className="rounded border border-purple-500 bg-purple-50 px-2 py-1 text-xs text-purple-700">
                KCSIE
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
