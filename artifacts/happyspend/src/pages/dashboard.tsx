import { useGetDashboard } from "@workspace/api-client-react";
import { formatMoney } from "@/lib/utils";
import { Card } from "@/components/ui-elements";
import { motion } from "framer-motion";
import { LogEntryDrawer } from "@/components/log-entry-drawer";
import { format } from "date-fns";

export default function Dashboard() {
  const { data, isLoading } = useGetDashboard();

  if (isLoading || !data) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-16 bg-muted rounded-2xl w-2/3" />
        <div className="h-40 bg-muted rounded-3xl" />
        <div className="h-24 bg-muted rounded-3xl" />
        <div className="space-y-4">
          <div className="h-20 bg-muted rounded-3xl" />
          <div className="h-20 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  const { user, personaProgress, categoryStatuses, recentEntries, weeklyStats } = data;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <header className="pt-4">
        <h1 className="text-3xl font-display font-bold text-foreground">Hey {user.name}! 👋</h1>
        {personaProgress && (
          <p className="text-muted-foreground font-medium mt-1">
            {personaProgress.persona.name} • {personaProgress.stage}
          </p>
        )}
      </header>

      {/* Progress */}
      {personaProgress && (
        <section>
          <div className="flex justify-between items-end mb-2">
            <h2 className="font-display font-semibold">Your Journey</h2>
            <span className="text-sm font-medium text-primary">{personaProgress.percentage}% to next milestone</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${personaProgress.percentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          {personaProgress.nextMilestone && (
            <p className="text-xs text-muted-foreground mt-2">Next up: {personaProgress.nextMilestone.label}</p>
          )}
        </section>
      )}

      {/* Weekly Stats */}
      <section>
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 shadow-xl shadow-black/5 overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">THIS WEEK</h2>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-4xl font-display font-bold text-foreground tracking-tight">
              {formatMoney(weeklyStats.totalSpent)}
            </span>
            <span className="text-lg text-muted-foreground mb-1 pb-0.5">/ {formatMoney(weeklyStats.totalBudgeted)}</span>
          </div>
          
          <div className="mt-4 inline-flex items-center px-3 py-1.5 rounded-xl bg-muted/50 text-sm font-medium">
            {weeklyStats.difference >= 0 ? (
              <span className="text-status-good">Saved {formatMoney(weeklyStats.difference)} so far</span>
            ) : (
              <span className="text-status-neutral">{formatMoney(Math.abs(weeklyStats.difference))} more than planned</span>
            )}
          </div>
        </Card>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl font-display font-bold mb-4">Intentions</h2>
        <div className="space-y-4">
          {categoryStatuses.map(status => (
            <CategoryBar key={status.category.id} status={status} />
          ))}
          {categoryStatuses.length === 0 && (
             <p className="text-muted-foreground text-center py-4">No categories set up yet.</p>
          )}
        </div>
      </section>

      {/* Recent Entries */}
      <section className="pb-10">
        <h2 className="text-xl font-display font-bold mb-4">Recent</h2>
        <div className="space-y-3">
          {recentEntries.map(entry => (
            <Card key={entry.id} className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl">
                {entry.categoryIcon || '💸'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{entry.description || entry.categoryName || 'Entry'}</h3>
                <p className="text-xs text-muted-foreground">{format(new Date(entry.entryDate), 'MMM d, h:mm a')}</p>
              </div>
              <div className="font-display font-bold text-lg">
                {formatMoney(entry.amount)}
              </div>
            </Card>
          ))}
          {recentEntries.length === 0 && (
             <p className="text-muted-foreground text-center py-4 bg-muted/30 rounded-2xl">No recent spending.</p>
          )}
        </div>
      </section>

      <LogEntryDrawer />
    </div>
  );
}

function CategoryBar({ status }: { status: any }) {
  const { category, percentageUsed, totalSpent, weeklyBudget, message } = status;
  
  // Use our positive framing colors
  let colorClass = "bg-status-good";
  if (percentageUsed > 75 && percentageUsed <= 100) colorClass = "bg-status-warning";
  if (percentageUsed > 100) colorClass = "bg-status-neutral";

  return (
    <Card className="p-5 border-none shadow-md shadow-black/5">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon}</span>
          <span className="font-semibold font-display">{category.name}</span>
        </div>
        <div className="text-right">
          <span className="font-display font-bold text-foreground">{formatMoney(totalSpent)}</span>
          <span className="text-sm text-muted-foreground ml-1">/ {formatMoney(weeklyBudget)}</span>
        </div>
      </div>
      
      <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
      <p className="text-xs font-medium text-muted-foreground">{message}</p>
    </Card>
  );
}
