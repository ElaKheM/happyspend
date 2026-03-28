import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button, Card } from "@/components/ui-elements";
import { LogOut, User as UserIcon, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function Profile() {
  const { data: user } = useGetMe();
  const logout = useLogout();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        localStorage.removeItem("happyspend_token");
        setLocation("/auth");
      }
    });
  };

  if (!user) return null;

  return (
    <div className="p-6">
      <header className="mb-8 pt-4">
        <h1 className="text-3xl font-display font-bold">Profile</h1>
      </header>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="w-5 h-5" />
            <span className="font-medium text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="w-5 h-5" />
            <span className="font-medium text-foreground">Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
          </div>
        </div>
      </Card>

      <Button 
        variant="outline" 
        className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
        onClick={handleLogout}
        disabled={logout.isPending}
      >
        <LogOut className="w-4 h-4 mr-2" />
        {logout.isPending ? "Logging out..." : "Log out"}
      </Button>
    </div>
  );
}
