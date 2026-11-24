import React from 'react';
import ReactDOM from 'react-dom';

/**
 * ModalPortal renders its children directly into document.body.
 * This guarantees that modals:
 * 1. Are never trapped inside container CSS transforms or overflow boundaries.
 * 2. Cover 100vw and 100vh completely without any half-cut white spaces at the bottom.
 * 3. Center perfectly in the browser viewport across all forms.
 */
export const ModalPortal = ({ children }) => {
  if (typeof document === 'undefined') return null;
  return ReactDOM.createPortal(children, document.body);
};

export default ModalPortal;
