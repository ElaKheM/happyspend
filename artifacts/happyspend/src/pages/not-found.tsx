import { Link } from "wouter";
import { Button } from "@/components/ui-elements";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">This path leads to nowhere. Let's get you back on track.</p>
        <Button asChild size="lg">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
