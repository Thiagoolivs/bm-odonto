import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20, rest: SVGProps<SVGSVGElement> = {}) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...rest,
});

export const ArrowRight = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M4 12h15M14 7l5 5-5 5" />
  </svg>
);
export const ArrowUpRight = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);
export const ArrowDown = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M12 4v15M7 14l5 5 5-5" />
  </svg>
);
export const Plus = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
/** uma sessão: círculo com ponto */
export const SessionIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);
export const ClockIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const SealIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M12 3 19 6v5.5c0 4.2-2.9 7.9-7 9.5-4.1-1.6-7-5.3-7-9.5V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
export const PinIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);
export const MetroIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <rect x="6" y="3.5" width="12" height="14" rx="3" />
    <path d="M6 11h12M9 17.5 7 20.5M15 17.5l2 3" />
    <circle cx="9.5" cy="14.2" r=".6" fill="currentColor" />
    <circle cx="14.5" cy="14.2" r=".6" fill="currentColor" />
  </svg>
);
export const CalendarIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </svg>
);
export const AvenueIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M5 21V9l4-3v15M9 21V4l6 3v14M15 21v-9l4 2v7M3 21h18" />
  </svg>
);
export const Star = ({ size, ...r }: P) => (
  <svg {...base(size, { fill: "currentColor", stroke: "none", ...r })}>
    <path d="m12 2.8 2.7 5.9 6.4.7-4.8 4.3 1.4 6.3L12 16.8 6.3 20l1.4-6.3L2.9 9.4l6.4-.7L12 2.8Z" />
  </svg>
);
export const InstagramIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r=".7" fill="currentColor" stroke="none" />
  </svg>
);
export const WhatsAppIcon = ({ size = 24, ...r }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...r}>
    <path d="M12.04 2.5a9.43 9.43 0 0 0-8.1 14.27L2.5 21.5l4.87-1.4a9.44 9.44 0 1 0 4.67-17.6Zm0 17.2a7.78 7.78 0 0 1-3.97-1.09l-.28-.17-2.9.83.85-2.82-.19-.29a7.77 7.77 0 1 1 6.49 3.54Zm4.27-5.82c-.23-.12-1.38-.68-1.6-.76-.21-.08-.37-.12-.53.12-.16.23-.6.75-.74.91-.14.16-.27.18-.5.06a6.38 6.38 0 0 1-1.88-1.16 7.07 7.07 0 0 1-1.3-1.62c-.14-.23 0-.36.1-.47.11-.11.24-.27.35-.41.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.27-.72-1.74-.19-.45-.38-.39-.53-.4h-.45a.87.87 0 0 0-.63.3 2.65 2.65 0 0 0-.83 1.97 4.6 4.6 0 0 0 .97 2.45 10.5 10.5 0 0 0 4.03 3.56c.56.24 1 .39 1.35.5.57.18 1.08.15 1.49.09.45-.07 1.38-.57 1.58-1.11.2-.55.2-1.02.14-1.12-.06-.1-.21-.16-.44-.28Z" />
  </svg>
);
export const MenuIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M4 9h16M8 15h12" />
  </svg>
);
export const CloseIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const DragIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}>
    <path d="M8 8 4 12l4 4M16 8l4 4-4 4M4 12h16" />
  </svg>
);
