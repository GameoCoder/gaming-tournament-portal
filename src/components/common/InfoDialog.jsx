import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const InfoTip = ({
  title,
  badge,
  ariaLabel,
  children,
  size = "sm",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className={`info-icon-btn ${size === "md" ? "info-icon-btn-md" : ""}`}
        aria-label={ariaLabel || `More info about ${title}`}
        title={`Info: ${title}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <div
            className="info-dialog-backdrop"
            role="presentation"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="info-dialog-card"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="info-dialog-header">
                <div style={{ minWidth: 0 }}>
                  {badge && <span className="info-dialog-badge">{badge}</span>}
                  <h3 className="info-dialog-title">{title}</h3>
                </div>
                <button
                  type="button"
                  className="info-dialog-close"
                  aria-label="Close info dialog"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="info-dialog-body">{children}</div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
