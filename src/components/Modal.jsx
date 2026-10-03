import { useEffect, useRef } from "react";

/** Accessible modal built on the native <dialog> element (focus trap + Esc). */
export default function Modal({ title, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop targets the <dialog> itself.
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-body">
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
