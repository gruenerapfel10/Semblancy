"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ShortcutHelp() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>LaTeX Editor Shortcuts</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="math">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="math">Math Mode Shortcuts</TabsTrigger>
            <TabsTrigger value="general">General Shortcuts</TabsTrigger>
          </TabsList>

          <TabsContent value="math" className="py-4">
            <div className="text-sm text-muted-foreground mb-4">
              <p className="font-medium text-foreground">Math shortcuts work everywhere!</p>
              <p>
                If you use a math shortcut outside a math environment, the editor will automatically wrap it in inline
                math delimiters ($...$).
              </p>
              <p>The editor will show "Math Mode" when you're inside a math environment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Structure Shortcuts</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-mono bg-muted px-2 py-1 rounded">/</div>
                    <div>
                      Insert fraction{" "}
                      <code>
                        \frac{}
                        {}
                      </code>
                      <div className="text-xs text-muted-foreground mt-1">
                        Type text or number first, then / to use it as numerator
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Auto-Completion</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-mono bg-muted px-2 py-1 rounded">(</div>
                    <div>
                      Auto-completes to <code>()</code> with cursor between
                    </div>

                    <div className="font-mono bg-muted px-2 py-1 rounded">[</div>
                    <div>
                      Auto-completes to <code>[]</code> with cursor between
                    </div>

                    <div className="font-mono bg-muted px-2 py-1 rounded">{"{"}</div>
                    <div>
                      Auto-completes to <code>{"{}"}</code> with cursor between
                    </div>

                    <div className="font-mono bg-muted px-2 py-1 rounded">example/</div>
                    <div>
                      Converts to <code>{"\\" + "frac{example}{}"}</code> with cursor in denominator
                    </div>

                    <div className="font-mono bg-muted px-2 py-1 rounded">(a+b)/</div>
                    <div>
                      Converts to <code>{"\\" + "frac{(a+b)}{}"}</code> with cursor in denominator
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="general" className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Editor Shortcuts</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-mono bg-muted px-2 py-1 rounded">Shift+$</div>
                  <div>Insert display math environment ($$$$)</div>

                  <div className="font-mono bg-muted px-2 py-1 rounded">Tab</div>
                  <div>Move to next argument in a command</div>

                  <div className="font-mono bg-muted px-2 py-1 rounded">Shift+Tab</div>
                  <div>Move to previous argument in a command</div>

                  <div className="font-mono bg-muted px-2 py-1 rounded">Ctrl+Z</div>
                  <div>Undo</div>

                  <div className="font-mono bg-muted px-2 py-1 rounded">Ctrl+Shift+Z</div>
                  <div>Redo</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Quick Insert Buttons</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the buttons in the toolbar to quickly insert common symbols and structures.
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Insert Math</div>
                  <div>Creates a new math environment</div>

                  <div className="font-medium">π, α, β, etc.</div>
                  <div>Inserts Greek letters</div>

                  <div className="font-medium">⅟, √, Σ, ∫</div>
                  <div>Inserts mathematical structures</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
