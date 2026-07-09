import React from "react";

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="toast">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
      {message}
    </div>
  );
}
