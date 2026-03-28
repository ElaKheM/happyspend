import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useGetPersonas, useCompleteOnboarding, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const DM_SANS = "'DM Sans', sans-serif";

const PERSONA_THEMES: Record<string, { bg: string; selectedBg: string; border: string; accent: string; illoBg: string }> = {
  "Steady Builder":      { bg: "#EEF4F0", selectedBg: "#D8EDE2", border: "#7C9E8A", accent: "#7C9E8A", illoBg: "#D6E8DF" },
  "Intentional Spender": { bg: "#F4F0E8", selectedBg: "#EAE3D0", border: "#B5956A", accent: "#B5956A", illoBg: "#E8DECE" },
  "Freedom Seeker":      { bg: "#EDF0F7", selectedBg: "#D4DFEF", border: "#6B84B8", accent: "#6B84B8", illoBg: "#CFDAEC" },
  "Debt Slayer":         { bg: "#F5EDEE", selectedBg: "#EDD8DC", border: "#B87080", accent: "#B87080", illoBg: "#EACACE" },
};

const PRESET_CATEGORIES = [
  { name: "Groceries",   colour: "155 30% 45%" },
  { name: "Eating Out",  colour: "25 80% 65%"  },
  { name: "Transport",   colour: "215 40% 60%" },
  { name: "Fun",         colour: "300 40% 65%" },
  { name: "Bills",       colour: "200 15% 50%" },
];

function GroceriesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C9E8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}

function EatingOutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C9E8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2s-4 2-4 9"/>
      <line x1="21" y1="15" x2="21" y2="22"/>
    </svg>
  );
}

function TransportIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C9E8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}

function FunIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C9E8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>
  );
}

function BillsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C9E8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}

function CustomIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C9E8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, () => JSX.Element> = {
  "Groceries":  GroceriesIcon,
  "Eating Out": EatingOutIcon,
  "Transport":  TransportIcon,
  "Fun":        FunIcon,
  "Bills":      BillsIcon,
};

function SteadyBuilderIllo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="9" r="5.5" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="20" y1="14.5" x2="20" y2="29" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 18 L13 26" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 18 L27 26" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 29 L15 39" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 29 L25 39" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M17 8 Q20 6 23 8" stroke="#8B7355" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function IntentionalSpenderIllo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="8" r="5.5" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="20" y1="13.5" x2="20" y2="27" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 18 L14 23 L15 28" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M20 18 L26 23 L25 28" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <rect x="13.5" y="27" width="13" height="8" rx="2.5" stroke="#7C9E8A" strokeWidth="1.6" fill="none"/>
      <path d="M20 27 L20 25" stroke="#7C9E8A" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 27 L17 25" stroke="#7C9E8A" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function FreedomSeekerIllo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="9" r="5.5" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="20" y1="14.5" x2="20" y2="30" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 19 L4 15" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 19 L36 15" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 30 L15 39" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 30 L25 39" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M4 12 L4 15" stroke="#8B7355" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M36 12 L36 15" stroke="#8B7355" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function DebtSlayerIllo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="22" cy="8.5" r="5.5" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M21 14 L19 29" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 19 L29 13" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 19 L11 23" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M19 29 L26 38" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M19 29 L13 38" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M28 11 L31 9" stroke="#8B7355" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

const PERSONA_ILLOS: Record<string, () => JSX.Element> = {
  "Steady Builder":      SteadyBuilderIllo,
  "Intentional Spender": IntentionalSpenderIllo,
  "Freedom Seeker":      FreedomSeekerIllo,
  "Debt Slayer":         DebtSlayerIllo,
};

function PersonIllustration() {
  return (
    <svg width="240" height="230" viewBox="0 0 240 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="120" cy="60" rx="30" ry="32" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M90 50 Q95 26 120 23 Q145 26 150 50" stroke="#8B7355" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M88 44 Q84 31 91 26" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
      <path d="M106 56 Q109 52 113 56" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
      <path d="M127 56 Q130 52 134 56" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
      <path d="M113 67 Q120 74 127 67" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="107" cy="63" r="3.5" fill="#f4b8a8" opacity="0.45"/>
      <circle cx="133" cy="63" r="3.5" fill="#f4b8a8" opacity="0.45"/>
      <path d="M114 92 L114 104 M126 92 L126 104" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M73 136 Q84 105 120 103 Q156 105 167 136" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M120 103 L120 170" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M88 112 Q76 133 72 160" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M72 160 Q70 168 78 170 Q84 166 82 158" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
      <path d="M152 112 Q164 133 168 160" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M168 160 Q170 168 162 170 Q156 166 158 158" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
      <path d="M108 170 Q103 183 90 192" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M132 170 Q137 183 150 192" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M183 192 L183 168" stroke="#7C9E8A" strokeWidth="2" strokeLinecap="round"/>
      <path d="M183 175 Q195 162 198 172 Q190 178 183 175Z" stroke="#7C9E8A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M183 170 Q171 161 169 170 Q175 175 183 170Z" stroke="#7C9E8A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <circle cx="62" cy="148" r="10" stroke="#8B7355" strokeWidth="1.8"/>
      <path d="M62 143 L62 153 M59 146 L65 146" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M42 122 L46 118 M43 118 L47 122" stroke="#7C9E8A" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="200" cy="82" r="4" stroke="#7C9E8A" strokeWidth="1.5"/>
      <path d="M196 60 L199 56 M200 57 L196 61" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ name: string; icon: string; monthlyBudget: number; colour: string }[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customBudget, setCustomBudget] = useState(0);

  const { data: personas } = useGetPersonas();
  const completeMutation = useCompleteOnboarding();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleComplete = () => {
    if (!selectedPersona || categories.length === 0) return;
    completeMutation.mutate(
      { data: { personaId: selectedPersona, categories } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation("/");
        },
      }
    );
  };

  const toggleCategory = (cat: typeof PRESET_CATEGORIES[0]) => {
    const existing = categories.findIndex((c) => c.name === cat.name);
    if (existing >= 0) {
      setCategories(categories.filter((c) => c.name !== cat.name));
    } else {
      setCategories([...categories, { name: cat.name, icon: cat.name, monthlyBudget: 0, colour: cat.colour }]);
    }
  };

  const updateBudget = (name: string, value: number) => {
    setCategories(categories.map((c) => (c.name === name ? { ...c, monthlyBudget: value } : c)));
  };

  const addCustomCategory = () => {
    if (!customName.trim()) return;
    setCategories([...categories, { name: customName.trim(), icon: "custom", monthlyBudget: customBudget, colour: "155 30% 45%" }]);
    setCustomName("");
    setCustomBudget(0);
    setShowCustomInput(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ fontFamily: DM_SANS, fontSize: 15, lineHeight: 1.6 }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-[#E8E4DC] z-10">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%`, background: "#7C9E8A" }}
        />
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1: WELCOME ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="flex-1 flex flex-col items-center justify-between px-8 pb-10 pt-16 text-center"
            style={{
              background: "linear-gradient(180deg, #FAF9F6 0%, #F0EDE6 100%)",
              minHeight: "100vh",
            }}
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="mb-8">
                <PersonIllustration />
              </div>

              <h1
                className="mb-4 text-foreground leading-tight"
                style={{ fontFamily: DM_SANS, fontWeight: 700, fontSize: 30 }}
              >
                Become someone who's<br />good with money.
              </h1>
              <p style={{ color: "#777", fontSize: 15, maxWidth: 280 }}>
                No spreadsheets. No guilt. Just building better habits that fit who you want to be.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-10 py-4 text-white font-semibold text-base transition-opacity hover:opacity-90 active:scale-95"
              style={{
                background: "#7C9E8A",
                borderRadius: 100,
                fontFamily: DM_SANS,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Let's Go
            </button>
          </motion.div>
        )}

        {/* ── STEP 2: PERSONA SELECTION ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="flex-1 flex flex-col px-5 pt-14 pb-8"
            style={{ background: "#FAF9F6", minHeight: "100vh" }}
          >
            <h2
              className="mb-1 text-foreground"
              style={{ fontFamily: DM_SANS, fontWeight: 700, fontSize: 26 }}
            >
              Who are you becoming?
            </h2>
            <p style={{ color: "#777", marginBottom: 24, fontSize: 14 }}>
              Pick one. You can grow into others later.
            </p>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-4" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {personas?.map((p) => {
                const theme = PERSONA_THEMES[p.name] ?? { bg: "#F5F5F5", selectedBg: "#E8E8E8", border: "#aaa", accent: "#aaa", illoBg: "#E0E0E0" };
                const isSelected = selectedPersona === p.id;
                const Illo = PERSONA_ILLOS[p.name];
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    className="w-full text-left transition-all duration-200"
                    style={{
                      height: 80,
                      background: isSelected ? theme.selectedBg : theme.bg,
                      borderRadius: 16,
                      boxShadow: isSelected
                        ? `0 4px 18px ${theme.border}40`
                        : "0 1px 6px rgba(0,0,0,0.06)",
                      padding: "0 16px 0 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      outline: "none",
                      border: "none",
                      borderLeft: `4px solid ${theme.border}`,
                    }}
                  >
                    {/* Illustration */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: isSelected ? theme.illoBg : theme.illoBg + "99",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {Illo && <Illo />}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontFamily: DM_SANS, fontWeight: 700, fontSize: 16, color: "#1a1a1a", lineHeight: 1.2 }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 13, color: "#666", fontWeight: 500, marginTop: 3, lineHeight: 1.3 }}>
                        {p.tagline}
                      </div>
                    </div>

                    {/* Radio button */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? theme.accent : "#CCC"}`,
                        background: isSelected ? theme.accent : "transparent",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      {isSelected && (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!selectedPersona}
              className="w-full mt-4 py-4 text-white font-semibold transition-opacity disabled:opacity-40"
              style={{
                background: "#7C9E8A",
                borderRadius: 100,
                fontFamily: DM_SANS,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              This is me
            </button>
          </motion.div>
        )}

        {/* ── STEP 3: CATEGORIES ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="flex-1 flex flex-col px-5 pt-14 pb-8"
            style={{ background: "#FAF9F6", minHeight: "100vh" }}
          >
            <h2
              className="mb-1 text-foreground"
              style={{ fontFamily: DM_SANS, fontWeight: 700, fontSize: 26 }}
            >
              Set your intentions
            </h2>
            <p style={{ color: "#777", marginBottom: 20, fontSize: 14 }}>
              Pick your spending areas and set a monthly budget for each.
            </p>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-4" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PRESET_CATEGORIES.map((cat) => {
                const isSelected = categories.some((c) => c.name === cat.name);
                const selectedCat = categories.find((c) => c.name === cat.name);
                const Icon = CATEGORY_ICONS[cat.name];
                return (
                  <div
                    key={cat.name}
                    className="w-full transition-all duration-200"
                    style={{
                      background: isSelected ? "#EEF4F0" : "#FFFFFF",
                      borderRadius: 14,
                      borderLeft: isSelected ? "4px solid #7C9E8A" : "4px solid transparent",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleCategory(cat)}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: isSelected ? "#D6E8DF" : "#F3F3F3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {Icon && <Icon />}
                    </div>

                    <span
                      className="flex-1"
                      style={{ fontFamily: DM_SANS, fontWeight: 600, fontSize: 15, color: "#1a1a1a" }}
                    >
                      {cat.name}
                    </span>

                    <div
                      className="flex items-center"
                      style={{ gap: 4 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span style={{ color: "#7C9E8A", fontWeight: 600, fontSize: 14 }}>R</span>
                      <input
                        type="number"
                        min={0}
                        value={isSelected ? (selectedCat?.monthlyBudget ?? 0) : 0}
                        disabled={!isSelected}
                        onChange={(e) => updateBudget(cat.name, Number(e.target.value))}
                        onFocus={() => {
                          if (!isSelected) toggleCategory(cat);
                        }}
                        placeholder="0"
                        style={{
                          width: 64,
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontFamily: DM_SANS,
                          fontSize: 15,
                          fontWeight: 600,
                          color: isSelected ? "#1a1a1a" : "#bbb",
                          textAlign: "right",
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Custom categories added by user */}
              {categories
                .filter((c) => !PRESET_CATEGORIES.find((p) => p.name === c.name))
                .map((cat, i) => (
                  <div
                    key={`custom-${i}`}
                    style={{
                      background: "#EEF4F0",
                      borderRadius: 14,
                      borderLeft: "4px solid #7C9E8A",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: "#D6E8DF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CustomIcon />
                    </div>
                    <span
                      className="flex-1"
                      style={{ fontFamily: DM_SANS, fontWeight: 600, fontSize: 15, color: "#1a1a1a" }}
                    >
                      {cat.name}
                    </span>
                    <div className="flex items-center" style={{ gap: 4 }}>
                      <span style={{ color: "#7C9E8A", fontWeight: 600, fontSize: 14 }}>R</span>
                      <input
                        type="number"
                        min={0}
                        value={cat.monthlyBudget}
                        onChange={(e) => updateBudget(cat.name, Number(e.target.value))}
                        style={{
                          width: 64,
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontFamily: DM_SANS,
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#1a1a1a",
                          textAlign: "right",
                        }}
                      />
                    </div>
                  </div>
                ))}

              {/* Custom category input row */}
              {showCustomInput && (
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 14,
                    borderLeft: "4px solid #c8d8cf",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Category name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontFamily: DM_SANS,
                      fontSize: 15,
                      color: "#1a1a1a",
                    }}
                  />
                  <span style={{ color: "#7C9E8A", fontWeight: 600, fontSize: 14 }}>R</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={customBudget || ""}
                    onChange={(e) => setCustomBudget(Number(e.target.value))}
                    style={{
                      width: 60,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontFamily: DM_SANS,
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#1a1a1a",
                      textAlign: "right",
                    }}
                  />
                  <button
                    onClick={addCustomCategory}
                    style={{
                      background: "#7C9E8A",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontFamily: DM_SANS,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Add custom category button */}
              {!showCustomInput && (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 transition-opacity hover:opacity-70"
                  style={{
                    background: "transparent",
                    border: "1.5px dashed #c8d8cf",
                    borderRadius: 14,
                    fontFamily: DM_SANS,
                    fontSize: 14,
                    color: "#7C9E8A",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add a category
                </button>
              )}
            </div>

            <button
              onClick={handleComplete}
              disabled={categories.length === 0 || completeMutation.isPending}
              className="w-full mt-4 py-4 text-white font-semibold transition-opacity disabled:opacity-40"
              style={{
                background: "#7C9E8A",
                borderRadius: 100,
                fontFamily: DM_SANS,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {completeMutation.isPending ? "Creating your space…" : "I'm ready"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
