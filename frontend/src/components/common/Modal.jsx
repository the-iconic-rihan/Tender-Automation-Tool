/* eslint-disable react/prop-types */
import { createPortal } from "react-dom";

import "../../assets/css/Modal.css";

const Modal = ({
  isOpen,
  onClose,
  children,
  closeOnOverlayClick = true,
  ...props
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={(e) => {
        e.stopPropagation();

        if (closeOnOverlayClick) {
          onClose();
        }
      }}
      className="modal-overlay"
    >
      <div {...props} className="modal">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
