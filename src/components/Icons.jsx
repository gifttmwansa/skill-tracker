/** App logo: three rising bars with a dot above the tallest one. */
export function Logo({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="Skill Tracker logo">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#428dff" />
          <stop offset="1" stopColor="#7c68f5" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-gradient)" />
      <rect x="14" y="38" width="9" height="12" rx="3" fill="#fff" fillOpacity="0.65" />
      <rect x="27.5" y="29" width="9" height="21" rx="3" fill="#fff" fillOpacity="0.85" />
      <rect x="41" y="20" width="9" height="30" rx="3" fill="#fff" />
      <circle cx="45.5" cy="12.5" r="3.5" fill="#ffd978" />
    </svg>
  );
}

function Icon({ children }) {
  return (
    <svg
      className="nav-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const HomeIcon = () => (
  <Icon>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h5v-6h4v6h5V9.5" />
  </Icon>
);

export const SkillsIcon = () => (
  <Icon>
    <path d="M4 6h16M4 12h16M4 18h10" />
  </Icon>
);

export const ActivityIcon = () => (
  <Icon>
    <path d="M3 12h4l3-8 4 16 3-8h4" />
  </Icon>
);

export const SettingsIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Icon>
);
