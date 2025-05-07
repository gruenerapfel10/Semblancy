import { Play, Circle, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SemblancyExactBento() {
  return (
    <section className="w-full bg-black py-16">
      <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl max-w-3xl">
            Build the most advanced exam preparation tools with our AI-powered platform
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AI Study Assistant Card */}
          <div className="rounded-xl bg-zinc-900 p-6 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-2">AI Study Assistant</h3>
            <p className="text-sm text-zinc-400 mb-8">
              Independently rated the leading AI tutor. Choose Comprehensive mode for detailed explanations; or Quick
              Review for rapid revision. Both support all exam boards.
            </p>

            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px w-4 bg-white/50" />
                <span className="text-white font-semibold">QuickReview</span>
              </div>
              <p className="text-sm text-zinc-400 pl-6">500ms response time for rapid revision</p>

              <div className="flex items-center gap-2">
                <div className="h-px w-4 bg-white/50" />
                <span className="text-white font-semibold">Comprehensive</span>
              </div>
              <p className="text-sm text-zinc-400 pl-6">Highest rated tutoring model for deep learning</p>
            </div>
          </div>

          {/* Practice Exam Generator Card */}
          <div className="rounded-xl bg-zinc-900 p-6 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-2">Practice Exam Generator</h3>
            <p className="text-sm text-zinc-400 mb-4">
              The <span className="underline">most accurate exam simulator</span>. Low cost and supporting all major
              exam boards with question-level feedback.
            </p>

            <div className="flex items-center gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white font-semibold">98%</span>
                </div>
                <p className="text-xs text-zinc-500 pl-6">Match rate</p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white font-semibold">£0.10</span>
                </div>
                <p className="text-xs text-zinc-500 pl-6">/exam on the student plan</p>
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <div className="flex justify-end">
                <div className="bg-emerald-900/50 text-emerald-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Circle className="h-2 w-2 fill-emerald-300" />
                  ExamMatch™
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-zinc-800 text-zinc-400 text-xs px-3 py-1 rounded-full">AQA Aligned</div>
              </div>
              <div className="flex justify-end">
                <div className="bg-zinc-800 text-zinc-400 text-xs px-3 py-1 rounded-full">Edexcel Compatible</div>
              </div>
            </div>
          </div>

          {/* Smart Revision Tools Card */}
          <div className="rounded-xl bg-zinc-900 p-6 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-2">Smart Revision Tools</h3>
            <p className="text-sm text-zinc-400 mb-4">
              The leading revision platform. Give students full control over their learning with adaptive flashcards,
              mind maps, and spaced repetition.
            </p>

            <div className="flex items-center gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white font-semibold">500+</span>
                </div>
                <p className="text-xs text-zinc-500 pl-6">Subjects</p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white font-semibold">15+</span>
                </div>
                <p className="text-xs text-zinc-500 pl-6">Exam boards</p>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button className="rounded-full bg-white text-black hover:bg-white/90 h-8 w-8 p-0">
                  <Play className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                  <div className="bg-white text-black text-xs px-3 py-1 rounded-full">FLASHCARDS</div>
                  <div className="bg-zinc-800 text-zinc-400 text-xs px-3 py-1 rounded-full">NOTES</div>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-900/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* AI Tutor Conversations Card - Spans 2 columns on desktop */}
          <div className="rounded-xl bg-zinc-900 p-6 md:col-span-2 flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold text-white mb-2">AI Tutor Conversations</h3>
              <p className="text-sm text-zinc-400 mb-6">
                Have natural conversations with subject-specific AI tutors. Ask questions, get explanations, and deepen
                your understanding in minutes.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white">Low latency responses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white">Subject matter experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white">Exam-focused guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white">Personalized explanations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white">25+ subjects covered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white">Supports all major exam boards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white">1000s of practice questions</span>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 flex items-center justify-center mt-6 md:mt-0">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300 via-pink-300 to-emerald-300 animate-slow-spin">
                  <Button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white text-black hover:bg-white/90 z-10">
                    <Circle className="mr-2 h-4 w-4 fill-black" />
                    TRY A LESSON
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Easy to use platform Card */}
          <div className="rounded-xl bg-zinc-900 p-6 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-2">Easy to use platform</h3>
            <p className="text-sm text-zinc-400 mb-6">
              The leading AI education platform, robust, scalable and quick to get started with.
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white">Mobile and desktop apps</span>
                </div>
                <p className="text-sm text-zinc-400 pl-6">Study anywhere, anytime</p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-white/50" />
                  <span className="text-white">GDPR & safeguarding compliant</span>
                </div>
                <p className="text-sm text-zinc-400 pl-6">Secure and compliant</p>
              </div>
            </div>

            <div className="mt-auto flex justify-end">
              <Button className="rounded-full bg-white text-black hover:bg-white/90">READ THE GUIDES</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
