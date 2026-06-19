import { createContext } from 'react';

// Value is a function: toast(message, type?) where type is 'success' | 'error'.
export const ToastContext = createContext(() => {});
