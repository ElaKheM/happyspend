import { useGetWeeklySummary } from "@workspace/api-client-react";
import { formatMoney } from "@/lib/utils";
import { Card } from "@/components/ui-elements";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Summary() {
  const { data: summary, isLoading } = useGetWeeklySummary();

  if (isLoading) {
    return <div className="p-6 pt-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!summary) {
    return <div className="p-6 pt-12 text-center text-muted-foreground">Check back at the end of the week for your summary!</div>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-5 text-xl flex flex-wrap justify-center content-start gap-16 p-8" aria-hidden="true">
        <span>📅</span><span className="mt-20">📊</span><span>✨</span><span className="mt-12">📅</span><span>📊</span><span className="mt-32">✨</span><span>📅</span><span className="mt-16">📊</span>
      </div>

      <div className="p-6 relative z-10 max-w-md mx-auto">
        <header className="mb-8 pt-8 flex flex-col items-center text-center">
          <div className="mb-6">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="25" y="30" width="70" height="75" rx="8" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M25 55 L95 55" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M40 20 L40 40 M80 20 L80 40" stroke="#8B7355" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M50 75 L60 85 L75 65" stroke="#5a7a5a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M90 20 C95 15 105 25 100 30 C95 35 85 25 90 20 Z" stroke="#8B7355" strokeWidth="2" />
            </svg>
          </div>
          <h1 className="text-3xl font-['Nunito'] font-extrabold text-foreground">Weekly Check-in</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {format(new Date(summary.weekStart), 'MMM d')} - {format(new Date(summary.weekEnd), 'MMM d, yyyy')}
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-10"
        >
          {/* Narrative Card */}
          <Card className="p-8 sm:p-10 bg-white border-none shadow-sm rounded-3xl">
            <div className="prose prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:text-lg">
              <p className="font-['Nunito'] font-extrabold text-2xl text-foreground mb-6 leading-tight">
                {summary.narrative.openingLine}
              </p>
              
              <ul className="space-y-4 mb-8 list-none pl-0">
                {summary.narrative.categoryHighlights.map((highlight, i) => (
                  <li key={i} className="flex gap-4 items-start text-foreground/80">
                    <span className="text-muted-foreground mt-1 text-xl">·</span>
                    <span className="text-lg">{highlight}</span>
                  </li>
                ))}
              </ul>

              <p className="font-medium text-muted-foreground italic text-lg border-t border-border/50 pt-6">
                {summary.narrative.closingLine}
              </p>
            </div>
          </Card>

          {/* Milestones Celebrations */}
          {summary.newMilestones.length > 0 && (
            <div className="space-y-4">
              {summary.newMilestones.map((m, i) => (
                <Card key={i} className="p-8 border-none shadow-sm rounded-3xl bg-[#fcfaf8] relative overflow-hidden flex flex-col items-center text-center">
                  <div className="absolute inset-0 pointer-events-none select-none opacity-5 text-xl flex flex-wrap justify-center content-center gap-8" aria-hidden="true">
                    <span>⭐</span><span className="mt-8">🌱</span><span>⭐</span><span className="mt-4">🌱</span>
                  </div>
                  
                  <div className="mb-6 relative z-10">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M40 20 L45 35 L60 35 L48 45 L52 60 L40 50 L28 60 L32 45 L20 35 L35 35 Z" stroke="#5a7a5a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M40 10 L40 5 M70 40 L75 40 M40 70 L40 75 M10 40 L5 40" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" />
                      <path d="M18 18 L14 14 M62 18 L66 14 M62 62 L66 66 M18 62 L14 66" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  
                  <h3 className="font-['Nunito'] font-extrabold text-2xl text-foreground mb-2 relative z-10">You hit a new milestone.</h3>
                  <div className="text-lg font-medium text-foreground capitalize mb-3 relative z-10">
                    {m.replace(/_/g, ' ')}
                  </div>
                  <p className="text-muted-foreground relative z-10">
                    That's not small. Keep going.
                  </p>
                </Card>
              ))}
            </div>
          )}

          {/* The Numbers */}
          <div className="pt-4 pb-12">
            <h3 className="font-['Nunito'] font-extrabold text-xl mb-6 text-center text-foreground/80">The Numbers</h3>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <Card className="p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-sm border-none bg-white rounded-3xl">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Spent</span>
                <span className="text-3xl font-display font-bold text-foreground">{formatMoney(summary.weekSummary.totalSpent)}</span>
              </Card>
              <Card className="p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-sm border-none bg-white rounded-3xl">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Budgeted</span>
                <span className="text-3xl font-display font-bold text-foreground">{formatMoney(summary.weekSummary.totalBudgeted)}</span>
              </Card>
              <Card className="p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-sm border-none bg-white rounded-3xl">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Days</span>
                <span className="text-3xl font-display font-bold text-foreground">{summary.weekSummary.daysLogged} / 7</span>
              </Card>
              <Card className="p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-sm border-none bg-white rounded-3xl">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Entries</span>
                <span className="text-3xl font-display font-bold text-foreground">{summary.weekSummary.entriesLogged}</span>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
