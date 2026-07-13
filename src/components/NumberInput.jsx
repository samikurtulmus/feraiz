import React, { useState } from "react";

// Odakta düz rakam, odak dışı TR format (5.000.000)
const formatTR = (digits) => (digits ? Number(digits).toLocaleString("tr-TR") : "");
const onlyDigits = (s) => (s || "").replace(/[^\d]/g, "");

export default function NumberInput({ valueDigits, onChangeDigits, placeholder = "0", className = "", ...rest }) {
  const [focused, setFocused] = useState(false);
  const display = focused ? (valueDigits || "") : formatTR(valueDigits);
  return (
    <input
      inputMode="numeric"
      value={display}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => onChangeDigits(onlyDigits(e.target.value))}
      className={`mt-1 w-full rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 border border-subtle focus:outline-none focus:ring-2 focus:ring-secondary/50 ${className}`}
      {...rest}
    />
  );
}
