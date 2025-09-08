
import React from 'react';

export const TranslateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14"></path>
    <path d="M12 5l7 7-7 7"></path>
    <path d="M19 12h-2"></path>
    <path d="M5 12l-2-2"></path>
    <path d="M5 12l-2 2"></path>
    <path d="M19.5 12.5a2.5 2.5 0 0 1-5 0"></path>
    <path d="M14.5 12.5a2.5 2.5 0 0 0 5 0"></path>
  </svg>
);
