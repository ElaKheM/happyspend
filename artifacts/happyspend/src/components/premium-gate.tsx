import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

const DM = "'DM Sans', sans-serif";
const SAGE = "#7C9E8A";

interface Props {
  featureName: string;
  onDismiss: () => void;
}

export function PremiumGate({ featureName, onDismiss }: Props) {
  const [, setLocation] = useLocation();

  const handleSeeMore = () => {
    onDismiss();
    setLocation("/upgrade");
  };

  return (
    <AnimatePresence>
      <motion.div
        key="premium-gate-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          maxWidth: 448,
          margin: "0 auto",
        }}
      >
        <motion.div
          key="premium-gate-panel"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#FAF9F6",
            borderRadius: "24px 24px 0 0",
            padding: "28px 24px 44px",
            fontFamily: DM,
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              background: "#DDD8CE",
              borderRadius: 100,
              margin: "0 auto 24px",
            }}
          />

          <p
            style={{
              fontWeight: 700,
              fontSize: 17,
              color: "#1a1a1a",
              marginBottom: 8,
              lineHeight: 1.35,
            }}
          >
            {featureName} is part of HappySpend Premium.
          </p>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 28, lineHeight: 1.55 }}>
            Unlock it for R49/month.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={handleSeeMore}
              style={{
                width: "100%",
                background: SAGE,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 100,
                padding: "15px 0",
                fontFamily: DM,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              See what's included
            </button>
            <button
              onClick={onDismiss}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                borderRadius: 100,
                padding: "13px 0",
                fontFamily: DM,
                fontWeight: 600,
                fontSize: 14,
                color: "#9C9690",
                cursor: "pointer",
              }}
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
