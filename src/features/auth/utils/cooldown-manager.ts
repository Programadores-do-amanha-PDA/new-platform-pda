import { useEffect, useState } from "react";

export interface CooldownConfig {
  duration: number; // Duration in seconds
  storageKey: string;
  emailStorageKey?: string;
}

export interface CooldownState {
  cooldown: number;
  lastSentEmail: string;
  isEmailChanged: boolean;
  canResend: boolean;
}

export interface CooldownActions {
  startCooldown: (email: string) => void;
  formatTime: (seconds: number) => string;
}

export const useCooldownManager = (
  config: CooldownConfig,
  currentEmail: string
): CooldownState & CooldownActions => {
  const [cooldown, setCooldown] = useState(0);
  const [lastSentEmail, setLastSentEmail] = useState<string>("");

  // Load cooldown from localStorage on mount and when email changes
  useEffect(() => {
    const loadCooldown = () => {
      if (typeof window === "undefined") return;

      const stored = localStorage.getItem(config.storageKey);
      if (stored) {
        try {
          const { endTime, email } = JSON.parse(stored);
          const remaining = Math.max(
            0,
            Math.floor((endTime - Date.now()) / 1000)
          );

          if (remaining > 0 && email === currentEmail) {
            setCooldown(remaining);
            setLastSentEmail(email);
          } else {
            localStorage.removeItem(config.storageKey);
          }
        } catch {
          localStorage.removeItem(config.storageKey);
        }
      }

      // Load last sent email from storage if available
      if (config.emailStorageKey) {
        const storedEmail = localStorage.getItem(config.emailStorageKey);
        if (storedEmail && !lastSentEmail) {
          setLastSentEmail(storedEmail);
        }
      }
    };

    loadCooldown();
  }, [config.storageKey, config.emailStorageKey, currentEmail, lastSentEmail]);

  // Countdown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        const newValue = prev - 1;

        if (newValue <= 0) {
          localStorage.removeItem(config.storageKey);
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown, config.storageKey]);

  const startCooldown = (email: string): void => {
    const endTime = Date.now() + config.duration * 1000;
    setCooldown(config.duration);
    setLastSentEmail(email);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        config.storageKey,
        JSON.stringify({ endTime, email })
      );

      if (config.emailStorageKey) {
        localStorage.setItem(config.emailStorageKey, email);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const isEmailChanged = currentEmail !== lastSentEmail;
  const canResend = cooldown === 0 || isEmailChanged;

  return {
    cooldown,
    lastSentEmail,
    isEmailChanged,
    canResend,
    startCooldown,
    formatTime,
  };
};