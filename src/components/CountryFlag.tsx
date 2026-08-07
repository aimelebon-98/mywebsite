// Inline SVG country flags for consistent cross-platform rendering.
// Aspect ratio 3:2. Simplified but recognizable.

interface Props {
  country: string; // ISO 3166-1 alpha-2 code
  className?: string;
  title?: string;
}

export default function CountryFlag({ country, className = "w-5 h-3.5", title }: Props) {
  const code = country.toUpperCase();
  const commonProps = {
    className,
    viewBox: "0 0 60 40",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-label": title || code,
    role: "img",
  } as const;

  switch (code) {
    // ============== EXISTING ==============
    case "US":
      return (
        <svg {...commonProps}>
          <rect width="60" height="40" fill="#B22234"/>
          {[3,9,15,21,27,33].map(y => <rect key={y} y={y} width="60" height="3" fill="#fff"/>)}
          <rect width="24" height="21" fill="#3C3B6E"/>
        </svg>
      );
    case "EU":
      return (
        <svg {...commonProps}>
          <rect width="60" height="40" fill="#003399"/>
          <g fill="#FFCC00">
            {Array.from({length:12}).map((_, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180;
              const cx = 30 + Math.cos(angle) * 12;
              const cy = 20 + Math.sin(angle) * 12;
              return <circle key={i} cx={cx} cy={cy} r="1.4"/>;
            })}
          </g>
        </svg>
      );
    case "GB":
    case "UK":
      return (
        <svg {...commonProps}>
          <rect width="60" height="40" fill="#012169"/>
          <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3"/>
          <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="10"/>
          <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6"/>
        </svg>
      );
    case "NG":
      return (
        <svg {...commonProps}>
          <rect width="20" height="40" fill="#008751"/>
          <rect x="20" width="20" height="40" fill="#fff"/>
          <rect x="40" width="20" height="40" fill="#008751"/>
        </svg>
      );
    case "GH":
      return (
        <svg {...commonProps}>
          <rect width="60" height="13.33" fill="#CE1126"/>
          <rect y="13.33" width="60" height="13.33" fill="#FCD116"/>
          <rect y="26.67" width="60" height="13.33" fill="#006B3F"/>
          <polygon points="30,15.5 32.4,22 39,22 33.8,26 35.8,32.5 30,28.5 24.2,32.5 26.2,26 21,22 27.6,22" fill="#000"/>
        </svg>
      );
    case "KE":
      return (
        <svg {...commonProps}>
          <rect width="60" height="10" fill="#000"/>
          <rect y="10" width="60" height="4" fill="#fff"/>
          <rect y="14" width="60" height="12" fill="#BB0000"/>
          <rect y="26" width="60" height="4" fill="#fff"/>
          <rect y="30" width="60" height="10" fill="#006600"/>
          <ellipse cx="30" cy="20" rx="4.5" ry="8" fill="#BB0000" stroke="#000" strokeWidth="0.5"/>
          <ellipse cx="30" cy="20" rx="2" ry="6" fill="#fff"/>
        </svg>
      );
    case "ZA":
      return (
        <svg {...commonProps}>
          <path d="M0,0 H60 V40 H0 Z" fill="#007749"/>
          <path d="M0,0 L28,20 L0,40 Z" fill="#000"/>
          <path d="M0,4 L22,20 L0,36 Z" fill="#FFB612"/>
          <path d="M0,10 L15,20 L0,30 Z" fill="#007749"/>
          <path d="M28,20 L60,40 H60 V28 L36,20 L60,12 V0 Z" fill="#fff"/>
          <path d="M28,20 L60,40 H60 V32 L44,20 L60,8 V0 Z" fill="#DE3831"/>
          <path d="M28,20 L60,40 H60 V36 L52,20 L60,4 V0 Z" fill="#002395"/>
        </svg>
      );
    case "FR":
      return (
        <svg {...commonProps}>
          <rect width="20" height="40" fill="#002395"/>
          <rect x="20" width="20" height="40" fill="#fff"/>
          <rect x="40" width="20" height="40" fill="#ED2939"/>
        </svg>
      );

    // ============== XOF (West African CFA) COUNTRIES ==============
    case "SN": // Senegal
      return (
        <svg {...commonProps}>
          <rect width="20" height="40" fill="#00853F"/>
          <rect x="20" width="20" height="40" fill="#FDEF42"/>
          <rect x="40" width="20" height="40" fill="#E31B23"/>
          <polygon points="30,15.5 32.4,22 39,22 33.8,26 35.8,32.5 30,28.5 24.2,32.5 26.2,26 21,22 27.6,22" fill="#00853F"/>
        </svg>
      );
    case "CI": // Ivory Coast (Cote d'Ivoire)
      return (
        <svg {...commonProps}>
          <rect width="20" height="40" fill="#F77F00"/>
          <rect x="20" width="20" height="40" fill="#fff"/>
          <rect x="40" width="20" height="40" fill="#009E60"/>
        </svg>
      );
    case "TG": // Togo
      return (
        <svg {...commonProps}>
          <rect width="60" height="8" fill="#006A4E"/>
          <rect y="8" width="60" height="8" fill="#FFCE00"/>
          <rect y="16" width="60" height="8" fill="#006A4E"/>
          <rect y="24" width="60" height="8" fill="#FFCE00"/>
          <rect y="32" width="60" height="8" fill="#006A4E"/>
          <rect width="24" height="24" fill="#D21034"/>
          <polygon points="12,4 14.4,10 21,10 15.8,14 17.8,20.5 12,16.5 6.2,20.5 8.2,14 3,10 9.6,10" fill="#fff"/>
        </svg>
      );
    case "BJ": // Benin
      return (
        <svg {...commonProps}>
          <rect width="24" height="40" fill="#008751"/>
          <rect x="24" width="36" height="20" fill="#FCD116"/>
          <rect x="24" y="20" width="36" height="20" fill="#E8112D"/>
        </svg>
      );
    case "BF": // Burkina Faso
      return (
        <svg {...commonProps}>
          <rect width="60" height="20" fill="#E8112D"/>
          <rect y="20" width="60" height="20" fill="#009E49"/>
          <polygon points="30,12 32.4,18.5 39,18.5 33.8,22.5 35.8,29 30,25 24.2,29 26.2,22.5 21,18.5 27.6,18.5" fill="#FCD116"/>
        </svg>
      );
    case "ML": // Mali
      return (
        <svg {...commonProps}>
          <rect width="20" height="40" fill="#14B53A"/>
          <rect x="20" width="20" height="40" fill="#FCD116"/>
          <rect x="40" width="20" height="40" fill="#CE1126"/>
        </svg>
      );
    case "NE": // Niger
      return (
        <svg {...commonProps}>
          <rect width="60" height="13.33" fill="#E05206"/>
          <rect y="13.33" width="60" height="13.33" fill="#fff"/>
          <rect y="26.67" width="60" height="13.33" fill="#0DB02B"/>
          <circle cx="30" cy="20" r="4" fill="#E05206"/>
        </svg>
      );
    case "GW": // Guinea-Bissau
      return (
        <svg {...commonProps}>
          <rect width="24" height="40" fill="#CE1126"/>
          <rect x="24" width="36" height="20" fill="#FCD116"/>
          <rect x="24" y="20" width="36" height="20" fill="#009E49"/>
          <polygon points="12,15 14.4,21 21,21 15.8,25 17.8,31 12,27 6.2,31 8.2,25 3,21 9.6,21" fill="#000"/>
        </svg>
      );

    // ============== XOF FALLBACK (unknown XOF country - green Africa map style) ==============
    case "XOF":
      return (
        <svg {...commonProps}>
          <rect width="60" height="40" fill="#009E60"/>
          <text x="30" y="26" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold" fontFamily="system-ui">CFA</text>
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <rect width="60" height="40" fill="#e5e7eb"/>
          <text x="30" y="24" textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="bold">{code}</text>
        </svg>
      );
  }
}

// Map currency code -> country ISO code
// For XOF, prefer visitor's actual country (via 2nd arg)
export function currencyToCountry(currency: string, visitorCountry?: string): string {
  // XOF: use the visitor's real country if it's a valid XOF country
  const XOF_COUNTRIES = ["SN", "CI", "TG", "BJ", "BF", "ML", "NE", "GW"];
  if (currency === "XOF" && visitorCountry) {
    const vc = visitorCountry.toUpperCase();
    if (XOF_COUNTRIES.includes(vc)) return vc;
  }

  const map: Record<string, string> = {
    USD: "US", EUR: "EU", GBP: "GB",
    NGN: "NG", GHS: "GH", KES: "KE",
    ZAR: "ZA", XOF: "XOF",
  };
  return map[currency] || currency.slice(0, 2);
}