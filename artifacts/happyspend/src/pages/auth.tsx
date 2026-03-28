import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Label } from "@/components/ui-elements";
import { useLogin, useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (isLogin) {
      loginMutation.mutate({ data: { email, password } }, {
        onSuccess: (res) => {
          localStorage.setItem("happyspend_token", res.token);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation("/");
        },
        onError: () => setErrorMsg("Invalid email or password.")
      });
    } else {
      if (!name) {
        setErrorMsg("Name is required.");
        return;
      }
      registerMutation.mutate({ data: { email, password, name } }, {
        onSuccess: (res) => {
          localStorage.setItem("happyspend_token", res.token);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation("/onboarding");
        },
        onError: () => setErrorMsg("Could not register. Try a different email.")
      });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col p-6 items-center justify-center bg-gradient-to-b from-background to-secondary/10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-3xl mx-auto mb-6 shadow-xl shadow-primary/20 flex items-center justify-center rotate-3">
            <span className="text-3xl text-primary-foreground font-display font-bold italic">H</span>
          </div>
          <h1 className="text-4xl font-display font-bold mb-2">HappySpend</h1>
          <p className="text-muted-foreground text-lg">Money tracking, without the guilt.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card p-6 sm:p-8 rounded-3xl shadow-xl shadow-black/5 border border-border/50">
          <h2 className="text-2xl font-display font-semibold mb-6">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>

          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="name">First Name</Label>
              <Input 
                id="name" 
                placeholder="Alex" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="alex@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          {errorMsg && (
            <p className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-xl">
              {errorMsg}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full mt-2" disabled={isPending}>
            {isPending ? "Please wait..." : (isLogin ? "Log In" : "Sign Up")}
          </Button>

          <div className="text-center mt-6">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
