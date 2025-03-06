'use client';

import { type JSX, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import './modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps): JSX.Element | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const portalRoot = typeof document !== 'undefined' ? document.body : null;
  if (!portalRoot) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {title && (
          <h2 className="modal-title">{title}</h2>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    portalRoot
  );
} 