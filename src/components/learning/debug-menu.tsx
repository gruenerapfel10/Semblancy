'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, RefreshCw, Plus, Minus, Trash2 } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { GenerationConstraints, VocabTypeConstraint, SentenceType } from '@/lib/learning/generation/structure-constraint.service';

interface DebugMenuProps {
  sessionState: any; // Pass the entire SessionState object for inspection
  onQuestionGenerated: (data: { 
    newQuestionData: any;
    newSubmoduleId: string;
    newModalSchemaId: string;
    newSubmoduleTitle: string;
    newUiComponent: string;
    questionDebugInfo: any;
  }) => void; // Callback to update parent state
}

export const DebugMenu: React.FC<DebugMenuProps> = ({ sessionState, onQuestionGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableSubmodules, setAvailableSubmodules] = useState<any[]>([]);
  const [availableModalSchemas, setAvailableModalSchemas] = useState<string[]>([]);
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState<string>('');
  const [selectedModalSchemaId, setSelectedModalSchemaId] = useState<string>('');
  
  // State for the FORCED constraints
  const [forcedConstraints, setForcedConstraints] = useState<Partial<GenerationConstraints>>({});
  const [posConstraints, setPosConstraints] = useState<VocabTypeConstraint[]>([{ pos: 'NOUN', count: 1 }, { pos: 'VERB', count: 1 }]);
  
  // Fetch module data (no longer tied to isOpen)
  useEffect(() => {
    if (sessionState.moduleId) { // Fetch whenever moduleId is available
      fetchModuleData(sessionState.moduleId);
    }
  }, [sessionState.moduleId]);
  
  // Reset forced constraints when module changes (no longer tied to isOpen)
  useEffect(() => {
    // Reset to some sensible defaults when module ID changes or component mounts
    setPosConstraints([{ pos: 'NOUN', count: 1 }, { pos: 'VERB', count: 1 }]);
    setForcedConstraints({
        numClauses: 1,
        sentenceType: SentenceType.STATEMENT,
        vocabularyTheme: null
    });
  }, [sessionState.moduleId]);
  
  // Fetch available submodules for the current module
  const fetchModuleData = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/learning/module?moduleId=${moduleId}`);
      if (response.ok) {
        const moduleData = await response.json();
        setAvailableSubmodules(moduleData.submodules || []);
        
        // Set initial selections
        if (moduleData.submodules?.length > 0) {
          const initialSubmodule = moduleData.submodules[0];
          setSelectedSubmoduleId(initialSubmodule.id);
          setAvailableModalSchemas(initialSubmodule.supportedModalSchemaIds || []);
          
          if (initialSubmodule.supportedModalSchemaIds?.length > 0) {
            setSelectedModalSchemaId(initialSubmodule.supportedModalSchemaIds[0]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch module data:", error);
    }
  };
  
  // Handle submodule selection change
  const handleSubmoduleChange = (submoduleId: string) => {
    setSelectedSubmoduleId(submoduleId);
    const selectedSubmodule = availableSubmodules.find(sm => sm.id === submoduleId);
    if (selectedSubmodule) {
      setAvailableModalSchemas(selectedSubmodule.supportedModalSchemaIds || []);
      
      // Reset modal schema selection if current selection is not supported
      if (selectedSubmodule.supportedModalSchemaIds?.length > 0) {
        if (!selectedSubmodule.supportedModalSchemaIds.includes(selectedModalSchemaId)) {
          setSelectedModalSchemaId(selectedSubmodule.supportedModalSchemaIds[0]);
        }
      } else {
        setSelectedModalSchemaId('');
      }
    }
  };
  
  // Handlers for updating POS constraints
  const handlePosChange = (index: number, value: string) => {
      const updated = [...posConstraints];
      updated[index].pos = value;
      setPosConstraints(updated);
  };
  const handleCountChange = (index: number, value: number) => {
      const updated = [...posConstraints];
      updated[index].count = Math.max(0, value);
      setPosConstraints(updated);
  };
  const addPosConstraint = () => {
      setPosConstraints([...posConstraints, { pos: '', count: 1 }]);
  };
  const removePosConstraint = (index: number) => {
      setPosConstraints(posConstraints.filter((_, i) => i !== index));
  };

  // Update generateNewQuestion to use the forced constraints state
  const generateNewQuestion = async () => {
    if (!sessionState.sessionId || !selectedSubmoduleId || !selectedModalSchemaId) return;
    
    setIsLoading(true);
    try {
        // Construct the full constraints object to send
        const constraintsToSend: GenerationConstraints = {
            targetLanguage: sessionState.targetLanguage, // Get from session state
            difficulty: sessionState.difficulty || 'intermediate', // Get from session state or default
            numClauses: forcedConstraints.numClauses ?? 1,
            sentenceType: forcedConstraints.sentenceType ?? SentenceType.STATEMENT,
            posConstraints: posConstraints.filter(pc => pc.pos && pc.count > 0),
            vocabularyTheme: forcedConstraints.vocabularyTheme || null,
            numRelativeClauses: forcedConstraints.numRelativeClauses ?? 0
        };
        
        console.log("[Debug] Sending constraints:", constraintsToSend);
        
      const response = await fetch(`/api/learning/session/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionState.sessionId,
          moduleId: sessionState.moduleId,
          targetLanguage: sessionState.targetLanguage,
          sourceLanguage: sessionState.sourceLanguage,
          forcedSubmoduleId: selectedSubmoduleId,
          forcedModalSchemaId: selectedModalSchemaId,
          // Send the constructed forced constraints
          forcedConstraints: constraintsToSend 
        }),
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log("[Debug] Received response:", responseData);
        if (responseData.success) {
          // Call the callback WITH the debug info
          onQuestionGenerated({
            newQuestionData: responseData.newQuestionData,
            newSubmoduleId: responseData.newSubmoduleId,
            newModalSchemaId: responseData.newModalSchemaId,
            newSubmoduleTitle: responseData.newSubmoduleTitle,
            newUiComponent: responseData.newUiComponent,
            // Pass the debug info received from the API
            questionDebugInfo: responseData.questionDebugInfo 
          });
        } else {
          console.error("API indicated failure:", responseData.error);
        }
      } else {
        console.error("Failed to generate new question");
      }
    } catch (error) {
      console.error("Error generating question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStateValue = (value: any): React.ReactNode => {
      if (value === null) return <span className="text-muted-foreground italic">null</span>;
      if (value === undefined) return <span className="text-muted-foreground italic">undefined</span>;
      if (typeof value === 'object') {
        try {
          const jsonString = JSON.stringify(value, null, 2);
          // If the string is very long, wrap it in a scrollable area
          if (jsonString.length > 500) { 
              return (
                  <ScrollArea className="h-[150px] w-full rounded-md border p-2 bg-background text-muted-foreground text-xs whitespace-pre-wrap break-words">
                      {jsonString}
                  </ScrollArea>
              );
          } else {
              return <span className="text-muted-foreground whitespace-pre-wrap break-words">{jsonString}</span>;
          }
        } catch {
          return <span className="text-red-500">[Circular Object]</span>;
        }
      }
      return <span className="text-muted-foreground">{String(value)}</span>;
  };

  // Helper to render the Debug Info section if available
  const renderDebugInfo = () => {
      if (!sessionState?.currentQuestionDebugInfo) {
          return (
              <div className="border-2 border-primary/30 p-4 rounded-md bg-primary/5">
                  <h3 className="text-lg font-semibold text-primary mb-3">Vocabulary Constraints</h3>
                  <div className="text-muted-foreground italic">
                      No debug information available yet. Generate a question to see constraints.
                  </div>
              </div>
          );
      }

      const { constraints, requiredVocab, enhancedPrompt } = sessionState.currentQuestionDebugInfo;
      
      // Log the data structure for debugging
      console.log('Debug Info:', {
          constraints,
          requiredVocab,
          enhancedPrompt
      });
      
      // Helper to render vocabulary items
      const renderVocabItems = (vocab: any[]) => {
          if (!vocab || !Array.isArray(vocab)) {
              return (
                  <div className="text-muted-foreground italic">
                      No vocabulary items selected
                  </div>
              );
          }
          
          return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {vocab.map((item, index) => (
                      <div 
                          key={index} 
                          className="p-2 rounded-md border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                          <div className="flex items-center justify-between">
                              <span className="font-semibold text-primary">{item.word}</span>
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                  {item.pos}
                              </span>
                          </div>
                          {item.theme && (
                              <div className="text-xs text-muted-foreground mt-1">
                                  Theme: {item.theme}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          );
      };

      return (
          <div className="space-y-4">
              {/* Vocabulary Constraints Card - Now at the top */}
              <div className="border-2 border-primary/30 p-4 rounded-md bg-primary/5">
                  <h3 className="text-lg font-semibold text-primary mb-3">Vocabulary Constraints</h3>
                  <div className="space-y-2">
                      <div className="flex items-center gap-2">
                          <span className="font-medium">Theme:</span>
                          <span className="text-primary">{constraints?.vocabularyTheme || 'None'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="font-medium">Required POS Counts:</span>
                          <div className="flex gap-2">
                              {constraints?.posConstraints?.length ? (
                                  constraints.posConstraints.map((pc: VocabTypeConstraint, i: number) => (
                                      <span key={i} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">
                                          {pc.pos}: {pc.count}
                                      </span>
                                  ))
                              ) : (
                                  <span className="text-muted-foreground italic">No POS constraints</span>
                              )}
                          </div>
                      </div>
                      <div className="mt-3">
                          <span className="font-medium block mb-2">Selected Words:</span>
                          {renderVocabItems(requiredVocab)}
                      </div>
                  </div>
              </div>

              {/* Rest of the debug info */}
              <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-3">Generation Details</h3>
                  <ScrollArea className="h-[300px] w-full rounded-md">
                      <div className="space-y-3 font-mono text-xs">
                          <div>
                              <span className="font-semibold text-primary/90">Full Constraints:</span> 
                              <div className="pl-2 mt-1 whitespace-pre-wrap break-words text-muted-foreground">
                                  {JSON.stringify(constraints || {}, null, 2)}
                              </div>
                          </div>
                          
                          {enhancedPrompt && (
                             <div>
                                <span className="font-semibold text-primary/90">Enhanced Prompt Used (truncated):</span> 
                                <div className="pl-2 mt-1 whitespace-pre-wrap break-words text-muted-foreground">
                                    {enhancedPrompt.substring(0, 400)}{enhancedPrompt.length > 400 ? '...' : ''}
                                </div>
                            </div>
                          )}    
                      </div>
                  </ScrollArea>
              </div>
          </div>
      );
  };

  // Rewrite the entire return statement to ensure correct syntax
  return (
    <div className="mt-4 space-y-6">
      {/* Force Generation Section */}
      <div className="space-y-4 border p-4 rounded-md">
        <h3 className="text-lg font-semibold">Force Generation</h3>
        
        <div className="space-y-2">
          <Label htmlFor="submodule">Submodule</Label>
          <Select 
            value={selectedSubmoduleId} 
            onValueChange={handleSubmoduleChange}
            disabled={availableSubmodules.length === 0}
          >
            <SelectTrigger id="submodule">
              <SelectValue placeholder="Select submodule" />
            </SelectTrigger>
            <SelectContent>
              {availableSubmodules.map((submodule) => (
                <SelectItem key={submodule.id} value={submodule.id}>
                  {submodule.title_en || submodule.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="modal-schema">Modal Schema</Label>
          <Select 
            value={selectedModalSchemaId} 
            onValueChange={setSelectedModalSchemaId}
            disabled={availableModalSchemas.length === 0}
          >
            <SelectTrigger id="modal-schema">
              <SelectValue placeholder="Select modal schema" />
            </SelectTrigger>
            <SelectContent>
              {availableModalSchemas.map((schemaId) => (
                <SelectItem key={schemaId} value={schemaId}>
                  {schemaId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Constraint Controls Section */}
        <div className="space-y-3 pt-3 border-t">
             <h4 className="font-medium text-md">Sentence Constraints</h4>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="num-clauses">Num Clauses</Label>
                    <Input id="num-clauses" type="number" min={1} value={forcedConstraints.numClauses ?? 1} onChange={(e) => setForcedConstraints(prev => ({...prev, numClauses: parseInt(e.target.value, 10) || 1}))} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="sentence-type">Sentence Type</Label>
                    <Select value={forcedConstraints.sentenceType ?? SentenceType.STATEMENT} onValueChange={(v) => setForcedConstraints(prev => ({...prev, sentenceType: v as SentenceType}))}>
                        <SelectTrigger id="sentence-type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.values(SentenceType).map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="num-rel-clauses">Num Relative Clauses</Label>
                    <Input id="num-rel-clauses" type="number" min={0} value={forcedConstraints.numRelativeClauses ?? 0} onChange={(e) => setForcedConstraints(prev => ({...prev, numRelativeClauses: parseInt(e.target.value, 10) || 0}))} />
                </div>
             </div>
             <div className="space-y-2">
                 <Label htmlFor="vocab-theme">Vocabulary Theme (Optional)</Label>
                 <Input id="vocab-theme" type="text" placeholder="e.g., travel, food" value={forcedConstraints.vocabularyTheme ?? ''} onChange={(e) => setForcedConstraints(prev => ({...prev, vocabularyTheme: e.target.value || null}))} />
             </div>
             
             <div className="space-y-2">
                 <Label>Vocabulary Type Counts</Label>
                 {posConstraints.map((pc, index) => (
                     <div key={index} className="flex items-center gap-2">
                         <Input 
                            placeholder="Type (e.g. NOUN)"
                            value={pc.pos}
                            onChange={(e) => handlePosChange(index, e.target.value)}
                            className="flex-1"
                         />
                         <Input 
                            type="number" 
                            min={0} 
                            value={pc.count} 
                            onChange={(e) => handleCountChange(index, parseInt(e.target.value, 10) || 0)}
                            className="w-16"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removePosConstraint(index)} aria-label="Remove POS constraint">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                     </div>
                 ))}
                 <Button variant="outline" size="sm" onClick={addPosConstraint} className="mt-1">
                     <Plus className="mr-1 h-4 w-4" /> Add Type
                 </Button>
             </div>
        </div>
        
        {/* Generate Button */}
        <Button 
          onClick={generateNewQuestion}
          disabled={isLoading || !selectedSubmoduleId || !selectedModalSchemaId}
          className="w-full mt-4"
        >
          {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Generating...' : 'Generate New Question'}
        </Button>
      </div>
      
      {/* Generation Debug Info Section */}
      {renderDebugInfo()} 
      
      {/* Current Session State Section */}
      <div className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Full Current Session State</h3>
          <ScrollArea className="h-[400px] w-full rounded-md"> 
              <div className="space-y-2 font-mono text-sm">
                {/* Filter out the debug info from the main state display */}
                {Object.entries(sessionState)
                    .filter(([key]) => key !== 'currentQuestionDebugInfo') 
                    .map(([key, value]) => (
                  <div key={key}>
                    <span className="font-semibold text-primary/90">{key}:</span> 
                    <div className="pl-2 mt-1">
                        {renderStateValue(value)}
                    </div>
                  </div>
                ))}
              </div>
          </ScrollArea>
      </div>
    </div>
  );
}; 