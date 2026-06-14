import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const savedValue = window.localStorage.getItem(key);
      return savedValue ? (JSON.parse(savedValue) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Visual preferences are non-critical; the app continues without storage.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
