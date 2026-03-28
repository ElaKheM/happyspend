import { useGetEntries } from "@workspace/api-client-react";
import { formatMoney } from "@/lib/utils";
import { Card } from "@/components/ui-elements";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Entries() {
  const { data: entries, isLoading } = useGetEntries();

  if (isLoading) {
    return <div className="p-6 pt-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  // Group by date
  const grouped = entries?.reduce((acc: any, entry) => {
    const date = format(new Date(entry.entryDate), 'MMMM d, yyyy');
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <header className="mb-8 pt-4">
        <h1 className="text-3xl font-display font-bold">History</h1>
        <p className="text-muted-foreground mt-1">Every step of your journey.</p>
      </header>

      <div className="space-y-8">
        {Object.entries(grouped || {}).map(([date, dayEntries]: [string, any], index) => (
          <motion.div 
            key={date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 ml-2">{date}</h3>
            <div className="space-y-3">
              {dayEntries.map((entry: any) => (
                <Card key={entry.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl">
                    {entry.categoryIcon || '💸'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{entry.description || entry.categoryName || 'Entry'}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{entry.inputMethod}</p>
                  </div>
                  <div className="font-display font-bold text-lg">
                    {formatMoney(entry.amount)}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        ))}

        {!entries?.length && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 opacity-50">🌱</div>
            <h3 className="text-xl font-display font-bold mb-2">A fresh start</h3>
            <p className="text-muted-foreground">Your logged entries will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
