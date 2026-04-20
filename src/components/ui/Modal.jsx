import React from "react";
import { AnimatePresence } from "framer-motion";

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="glass w-full max-w-3xl overflow-hidden rounded-[32px]"
          >
            <div className="border-b border-white/10 bg-white/5 px-6 py-5">
              <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
            {footer && (
              <div className="border-t border-white/10 bg-white/5 px-6 py-4">
                {footer}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
