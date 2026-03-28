import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button, Input, Label, Card } from "@/components/ui-elements";
import { useGetPersonas, useCompleteOnboarding, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_CATEGORIES = [
  { name: "Groceries", icon: "🛒", colour: "155 30% 45%" },
  { name: "Eating Out", icon: "🍽️", colour: "25 80% 65%" },
  { name: "Transport", icon: "🚌", colour: "215 40% 60%" },
  { name: "Fun", icon: "🎉", colour: "300 40% 65%" },
  { name: "Bills", icon: "🏠", colour: "200 15% 50%" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [categories, setCategories] = useState<{name: string, icon: string, monthlyBudget: number, colour: string}[]>([]);
  
  const { data: personas } = useGetPersonas();
  const completeMutation = useCompleteOnboarding();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleComplete = () => {
    if (!selectedPersona || categories.length === 0) return;
    
    completeMutation.mutate({
      data: {
        personaId: selectedPersona,
        categories: categories
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-muted z-10">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none select-none opacity-5 text-2xl flex flex-wrap justify-center content-center gap-12 p-8" aria-hidden="true">
              <span>💸</span><span className="mt-12">✨</span><span>💸</span><span className="mt-8">✨</span><span>💸</span><span className="mt-20">✨</span><span>💸</span>
            </div>
            
            <div className="mb-16 mt-8 relative z-10">
              <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                <path d="M40 120 C40 120 40 140 60 140 C80 140 160 140 180 140 C200 140 200 120 200 120 L200 70 C200 70 200 50 180 50 C160 50 80 50 60 50 C40 50 40 70 40 70 Z" stroke="#8B7355" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M40 70 L200 70" stroke="#8B7355" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M160 95 C160 95 160 105 170 105 C180 105 180 95 180 95 C180 95 180 85 170 85 C160 85 160 95 160 95 Z" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M120 50 C120 50 115 30 130 15 C130 15 145 25 140 40" stroke="#5a7a5a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M120 50 C120 50 105 35 90 40 C90 40 95 20 110 25" stroke="#5a7a5a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M120 50 L120 25" stroke="#5a7a5a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M60 140 L60 150 M180 140 L180 150" stroke="#8B7355" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-['Nunito'] font-extrabold mb-6 text-foreground relative z-10 leading-tight">Become someone who's good with money.</h1>
            <p className="text-lg text-muted-foreground mb-16 relative z-10 max-w-sm mx-auto leading-relaxed">No spreadsheets. No guilt. Just building better habits that fit who you want to be.</p>
            <Button size="lg" className="w-full max-w-xs relative z-10 py-6 text-lg rounded-2xl" onClick={() => setStep(2)}>Let's Go</Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-12"
          >
            <h2 className="text-3xl font-display font-bold mb-2">Who are you becoming?</h2>
            <p className="text-muted-foreground mb-8">Choose the path that feels right for you right now.</p>
            
            <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pb-6">
              {personas?.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={cn(
                    "w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 group",
                    selectedPersona === p.id 
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <h3 className="font-display font-bold text-xl mb-1 flex items-center justify-between">
                    {p.name}
                    {selectedPersona === p.id && <Check className="text-primary w-5 h-5" />}
                  </h3>
                  <p className="font-medium text-foreground mb-2">{p.tagline}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </button>
              ))}
            </div>

            <Button 
              size="lg" 
              disabled={!selectedPersona} 
              onClick={() => setStep(3)}
              className="mt-auto"
            >
              This is me
            </Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-12"
          >
            <h2 className="text-3xl font-display font-bold mb-2">Set your intentions</h2>
            <p className="text-muted-foreground mb-6">Create at least one category to track. You can add more later.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {PRESET_CATEGORIES.map(cat => {
                const isSelected = categories.some(c => c.name === cat.name);
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      if (isSelected) {
                        setCategories(categories.filter(c => c.name !== cat.name));
                      } else {
                        setCategories([...categories, { ...cat, monthlyBudget: 200 }]);
                      }
                    }}
                    className={cn(
                      "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                      isSelected ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="font-medium text-sm">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {categories.length > 0 && (
              <div className="space-y-4 mb-6 flex-1 overflow-y-auto no-scrollbar">
                <h3 className="font-display font-semibold text-lg">Monthly Intentions</h3>
                {categories.map((cat, i) => (
                  <Card key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-display">$</span>
                      <Input 
                        type="number" 
                        value={cat.monthlyBudget}
                        onChange={(e) => {
                          const newCats = [...categories];
                          newCats[i].monthlyBudget = Number(e.target.value);
                          setCategories(newCats);
                        }}
                        className="w-24 h-10 text-right font-display"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Button 
              size="lg" 
              className="mt-auto"
              disabled={categories.length === 0 || completeMutation.isPending}
              onClick={handleComplete}
            >
              {completeMutation.isPending ? "Creating your space..." : "I'm ready"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
