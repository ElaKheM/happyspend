import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Mic, Camera, PenLine, Check } from "lucide-react";
import { useCreateEntry, useGetCategories, getGetDashboardQueryKey, getGetEntriesQueryKey, getGetCategoryStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input, Label, Card } from "@/components/ui-elements";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function LogEntryDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"manual" | "voice" | "photo">("manual");
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  
  const { data: categories } = useGetCategories();
  const createEntry = useCreateEntry();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const resetForm = () => {
    setAmount("");
    setCategoryId("");
    setDescription("");
    setTab("manual");
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetForm, 300);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showConfirmation) {
      timeout = setTimeout(() => {
        handleClose();
      }, 2500);
    }
    return () => clearTimeout(timeout);
  }, [showConfirmation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    createEntry.mutate({
      data: {
        amount: parseFloat(amount),
        categoryId,
        description: description || null,
        inputMethod: tab,
        entryDate: new Date().toISOString()
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCategoryStatusQueryKey() });
        setShowConfirmation(true);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 z-30"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 max-w-md mx-auto"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card rounded-t-3xl z-50 p-6 shadow-2xl border-t border-border h-[85vh] flex flex-col"
            >
              {!showConfirmation && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-display font-bold">Log Spending</h2>
                    <button onClick={handleClose} className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex bg-muted p-1 rounded-2xl mb-8">
                    <TabButton active={tab === "manual"} onClick={() => setTab("manual")} icon={<PenLine className="w-4 h-4" />} label="Manual" />
                    <TabButton active={tab === "voice"} onClick={() => setTab("voice")} icon={<Mic className="w-4 h-4" />} label="Voice" />
                    <TabButton active={tab === "photo"} onClick={() => setTab("photo")} icon={<Camera className="w-4 h-4" />} label="Photo" />
                  </div>
                </>
              )}

              <div className="flex-1 overflow-y-auto no-scrollbar">
                {showConfirmation ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 relative overflow-hidden min-h-[50vh]">
                    <div className="absolute inset-0 pointer-events-none select-none opacity-5 text-2xl flex flex-wrap justify-center content-center gap-12 p-8" aria-hidden="true">
                      <span>✓</span><span className="mt-12">✨</span><span>✓</span><span className="mt-8">✨</span><span>✓</span><span className="mt-20">✨</span><span>✓</span>
                    </div>
                    
                    <div className="mb-8 relative z-10">
                      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="60" cy="60" r="40" stroke="#5a7a5a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 4" />
                        <path d="M40 60 L55 75 L80 45" stroke="#5a7a5a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20 20 L25 25 M100 20 L95 25 M20 100 L25 95 M100 100 L95 95" stroke="#5a7a5a" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                    
                    <h2 className="text-4xl font-['Nunito'] font-extrabold mb-4 relative z-10 text-foreground">Logged.</h2>
                    <p className="text-muted-foreground mb-12 text-lg max-w-[240px] leading-relaxed relative z-10 mx-auto">
                      One more proof that you're becoming someone who's good with money.
                    </p>
                    
                    <Button 
                      size="lg" 
                      className="w-full relative z-10 rounded-2xl py-6 text-lg" 
                      onClick={() => {
                        handleClose();
                      }}
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <>
                    {tab === "manual" && (
                      <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label>Amount</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-display text-xl">$</span>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          className="pl-8 text-xl font-display font-medium h-16"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Category</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {categories?.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCategoryId(c.id)}
                            className={cn(
                              "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 text-left",
                              categoryId === c.id 
                                ? "border-primary bg-primary/5 text-primary" 
                                : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
                            )}
                          >
                            <span className="text-2xl">{c.icon}</span>
                            <span className="font-medium text-sm truncate w-full text-center">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>What was it? (Optional)</Label>
                      <Input 
                        placeholder="Coffee, groceries, etc..." 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full" 
                        disabled={!amount || !categoryId || createEntry.isPending}
                      >
                        {createEntry.isPending ? "Saving..." : "Log it"}
                      </Button>
                    </div>
                  </form>
                )}

                {tab !== "manual" && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                    <div className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center text-secondary-foreground animate-pulse">
                      {tab === "voice" ? <Mic className="w-10 h-10" /> : <Camera className="w-10 h-10" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold mb-2">
                        {tab === "voice" ? "Just say what you bought" : "Snap a receipt"}
                      </h3>
                      <p className="text-muted-foreground">
                        This feature is coming soon to help you log effortlessly. For now, use the manual tab!
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => setTab("manual")}>Switch to Manual</Button>
                  </div>
                )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon} {label}
    </button>
  );
}
