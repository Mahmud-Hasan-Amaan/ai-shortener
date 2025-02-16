"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function RedirectAnimation({ url }: { url: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = url;
    }, 3000);

    return () => clearTimeout(timer);
  }, [url]);

  // Pre-defined positions for particles to avoid hydration mismatch
  const particlePositions = [
    { top: "20%", left: "10%" },
    { top: "80%", left: "20%" },
    { top: "40%", left: "30%" },
    { top: "60%", left: "40%" },
    { top: "30%", left: "50%" },
    { top: "70%", left: "60%" },
    { top: "25%", left: "70%" },
    { top: "75%", left: "80%" },
    { top: "45%", left: "90%" },
    { top: "85%", left: "15%" },
    { top: "15%", left: "25%" },
    { top: "65%", left: "35%" },
    { top: "35%", left: "45%" },
    { top: "55%", left: "55%" },
    { top: "25%", left: "65%" },
    { top: "75%", left: "75%" },
    { top: "45%", left: "85%" },
    { top: "15%", left: "95%" },
    { top: "85%", left: "5%" },
    { top: "50%", left: "50%" },
  ];

  return (
    <div className="h-screen w-full bg-gradient-to-br from-background via-primary/5 to-primary/10 flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        {/* Outer spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="w-48 h-48 rounded-full border-t-4 border-r-4 border-primary"
        />

        {/* Middle spinning ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-0 w-40 h-40 m-auto rounded-full border-t-4 border-l-4 border-primary/60"
        />

        {/* Inner spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-0 w-32 h-32 m-auto rounded-full border-t-4 border-r-4 border-primary/40"
        />

        {/* Glowing center dot with enhanced effects */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            boxShadow: [
              "0 0 20px 10px rgba(0,255,136,0.3)",
              "0 0 40px 20px rgba(0,255,136,0.4)",
              "0 0 20px 10px rgba(0,255,136,0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-primary"
        />

        {/* Orbiting dots with trails */}
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            animate={{ rotate: 360 }}
            transition={{
              duration: 4 - index * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute inset-0 m-auto"
            style={{
              width: `${48 - index * 8}px`,
              height: `${48 - index * 8}px`,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
                boxShadow: [
                  "0 0 10px 2px rgba(0,255,136,0.2)",
                  "0 0 15px 4px rgba(0,255,136,0.3)",
                  "0 0 10px 2px rgba(0,255,136,0.2)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.3,
              }}
              className="w-2 h-2 rounded-full bg-primary absolute"
              style={{ top: 0, left: "50%", transform: "translateX(-50%)" }}
            />
          </motion.div>
        ))}

        {/* Pulsing rings */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={`pulse-${index}`}
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.6,
              ease: "easeOut",
            }}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full border border-primary/30"
          />
        ))}
      </motion.div>

      {/* Loading text with glow effect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 space-y-4 text-center"
      >
        <motion.h2
          animate={{
            opacity: [0.5, 1, 0.5],
            textShadow: [
              "0 0 10px rgba(0,255,136,0.3)",
              "0 0 20px rgba(0,255,136,0.5)",
              "0 0 10px rgba(0,255,136,0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-2xl font-bold text-primary"
        >
          Redirecting...
        </motion.h2>
        <p className="text-muted-foreground">Taking you to your destination</p>
      </motion.div>

      {/* Background particles */}
      {particlePositions.map((position, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
            y: [0, -30, 0],
            x: [0, i % 2 === 0 ? 30 : -30, 0],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
          className={`absolute w-2 h-2 rounded-full ${
            i % 3 === 0
              ? "bg-primary/40"
              : i % 3 === 1
              ? "bg-primary/30"
              : "bg-primary/20"
          }`}
          style={position}
        />
      ))}
    </div>
  );
}
