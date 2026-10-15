import React from 'react';

export interface RateYourPlateLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  variant?: 'default' | 'light' | 'monochrome';
  showTagline?: boolean;
  showRatingStars?: boolean;
  className?: string;
  onClick?: () => void;
}

export const RateYourPlateLogo: React.FC<RateYourPlateLogoProps> = ({
  size = 'sm',
  variant = 'default',
  showTagline = false,
  showRatingStars = true,
  className = '',
  onClick,
}) => {
  // Dimensions based on size
  const iconDimensions = {
    xs: { width: 24, height: 24, text: 'text-sm', subText: 'text-[9px]' },
    sm: { width: 34, height: 34, text: 'text-lg', subText: 'text-[10px]' },
    md: { width: 44, height: 44, text: 'text-xl', subText: 'text-xs' },
    lg: { width: 56, height: 56, text: 'text-2xl', subText: 'text-xs' },
    xl: { width: 72, height: 72, text: 'text-3xl', subText: 'text-sm' },
    icon: { width: 36, height: 36, text: '', subText: '' },
  }[size];

  const isLight = variant === 'light';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      aria-label="RateYourPlate Logo"
    >
      {/* Visual Logo Mark: Food Plate + Fork & Knife + 5-Star Rating Arc */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
        style={{ width: iconDimensions.width, height: iconDimensions.height }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Background / Plate Gradients */}
            <radialGradient id="plateRimGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#FAF7F2" />
              <stop offset="95%" stopColor="#EADDCB" />
              <stop offset="100%" stopColor="#DFCEB8" />
            </radialGradient>

            <radialGradient id="plateInnerGrad" cx="45%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#FFFDFB" />
              <stop offset="85%" stopColor="#F5ECE0" />
              <stop offset="100%" stopColor="#EADAC7" />
            </radialGradient>

            {/* Cloche / Gourmet Food Dome Gradient */}
            <linearGradient id="clocheGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="50%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            {/* Gold Star Gradient */}
            <linearGradient id="goldStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#78350F" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Outer Platter Shadow */}
          <ellipse cx="50" cy="58" rx="42" ry="34" fill="#000000" fillOpacity="0.08" />

          {/* Ceramic Plate - Outer Rim */}
          <ellipse
            cx="50"
            cy="56"
            rx="40"
            ry="32"
            fill="url(#plateRimGrad)"
            stroke="#CBB396"
            strokeWidth="1.8"
          />

          {/* Plate Rim Highlight Ring */}
          <ellipse
            cx="50"
            cy="55"
            rx="33"
            ry="25"
            fill="none"
            stroke="#DFCEB8"
            strokeWidth="1"
            strokeDasharray="1 0"
          />

          {/* Plate Basin (Food Serving Bed) */}
          <ellipse
            cx="50"
            cy="56"
            rx="27"
            ry="20"
            fill="url(#plateInnerGrad)"
            stroke="#DEC7AD"
            strokeWidth="1.2"
          />

          {/* Left Cutlery: Sleek Gourmet Fork */}
          <g opacity="0.85" className="transition-opacity group-hover:opacity-100">
            {/* Fork handle */}
            <path
              d="M13 74 C13 76, 15 76, 15 74 L15 54 C15 51, 14 48, 11 46"
              stroke="#92400E"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Fork prongs base */}
            <path
              d="M8 44 C8 39, 17 39, 17 44"
              stroke="#92400E"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Fork prongs */}
            <path d="M9 39 L9 43 M12.5 38 L12.5 43 M16 39 L16 43" stroke="#92400E" strokeWidth="1.6" strokeLinecap="round" />
          </g>

          {/* Right Cutlery: Sleek Dining Knife */}
          <g opacity="0.85" className="transition-opacity group-hover:opacity-100">
            {/* Knife handle */}
            <path
              d="M87 74 C87 76, 85 76, 85 74 L85 54 C85 49, 87 45, 87 39 C87 36, 89 36, 89 39 L89 54 C89 56, 87 58, 87 74 Z"
              fill="#92400E"
            />
          </g>

          {/* Delicious Gourmet Dish / Cloche Cloche Accent in Center */}
          <g id="gourmetCourse">
            {/* Gourmet cloche dome */}
            <path
              d="M32 58 C32 46, 68 46, 68 58 Z"
              fill="url(#clocheGrad)"
              filter="url(#badgeShadow)"
            />
            {/* Cloche rim platter */}
            <rect x="30" y="58" width="40" height="3.5" rx="1.75" fill="#78350F" />
            {/* Cloche golden ring handle */}
            <circle cx="50" cy="45" r="3.2" fill="none" stroke="#F59E0B" strokeWidth="1.8" />
            <circle cx="50" cy="45" r="1.5" fill="#D97706" />

            {/* Aromatic steam swirls */}
            <path
              d="M45 40 C43 36, 47 34, 45 30"
              stroke="#D97706"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
            <path
              d="M55 40 C57 37, 53 35, 55 31"
              stroke="#D97706"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
          </g>

          {/* 5 Dynamic Rating Stars Arched Gloriously Above the Plate */}
          {showRatingStars && (
            <g id="ratingStars">
              {/* Star 1 (Far Left) */}
              <path
                d="M19 25 L20.5 28.5 L24 29 L21.5 31.5 L22 35 L19 33 L16 35 L16.5 31.5 L14 29 L17.5 28.5 Z"
                fill="url(#goldStarGrad)"
                filter="url(#badgeShadow)"
                transform="rotate(-18 19 30)"
              />
              {/* Star 2 (Mid Left) */}
              <path
                d="M33 16 L34.8 20 L39 20.6 L36 23.5 L36.7 27.5 L33 25 L29.3 27.5 L30 23.5 L27 20.6 L31.2 20 Z"
                fill="url(#goldStarGrad)"
                filter="url(#badgeShadow)"
                transform="rotate(-9 33 21)"
              />
              {/* Star 3 (Center Top - Prominent Hero Star) */}
              <g transform="translate(0, -1)">
                <path
                  d="M50 7 L52.4 12.5 L58 13.3 L54 17.2 L55 22.8 L50 19.8 L45 22.8 L46 17.2 L42 13.3 L47.6 12.5 Z"
                  fill="url(#goldStarGrad)"
                  filter="url(#badgeShadow)"
                />
                {/* Center Star sparkle core */}
                <circle cx="50" cy="15.5" r="1.5" fill="#FEF3C7" />
              </g>
              {/* Star 4 (Mid Right) */}
              <path
                d="M67 16 L68.8 20 L73 20.6 L70 23.5 L70.7 27.5 L67 25 L63.3 27.5 L64 23.5 L61 20.6 L65.2 20 Z"
                fill="url(#goldStarGrad)"
                filter="url(#badgeShadow)"
                transform="rotate(9 67 21)"
              />
              {/* Star 5 (Far Right) */}
              <path
                d="M81 25 L82.5 28.5 L86 29 L83.5 31.5 L84 35 L81 33 L78 35 L78.5 31.5 L76 29 L79.5 28.5 Z"
                fill="url(#goldStarGrad)"
                filter="url(#badgeShadow)"
                transform="rotate(18 81 30)"
              />
            </g>
          )}

          {/* Mini 5.0 Star Badge Pill overlapping plate corner */}
          <g transform="translate(62, 70)">
            <rect
              x="0"
              y="0"
              width="32"
              height="16"
              rx="8"
              fill="#78350F"
              stroke="#F59E0B"
              strokeWidth="1.2"
              filter="url(#badgeShadow)"
            />
            {/* Mini star */}
            <path
              d="M7 5.5 L8 7.5 L10.5 7.8 L8.8 9.5 L9.2 12 L7 10.7 L4.8 12 L5.2 9.5 L3.5 7.8 L6 7.5 Z"
              fill="#FDE68A"
            />
            {/* Text '5.0' */}
            <text
              x="13"
              y="12"
              fill="#FEF3C7"
              fontSize="8.5"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              5.0
            </text>
          </g>
        </svg>
      </div>

      {/* Typography / Wordmark */}
      {size !== 'icon' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline tracking-tight">
            <span
              className={`font-extrabold ${iconDimensions.text} ${
                isLight ? 'text-amber-400' : 'text-amber-800'
              }`}
            >
              Rate
            </span>
            <span
              className={`font-medium ${iconDimensions.text} ${
                isLight ? 'text-stone-300' : 'text-stone-700'
              } mx-0.5`}
            >
              Your
            </span>
            <span
              className={`font-serif-display font-bold italic ${iconDimensions.text} ${
                isLight ? 'text-white' : 'text-stone-900'
              }`}
            >
              Plate
            </span>
            {/* Small glowing star dot accent */}
            <span className="text-amber-500 text-xs ml-0.5 animate-pulse font-normal">
              ✦
            </span>
          </div>

          {showTagline && (
            <span
              className={`font-sans tracking-wide uppercase font-semibold ${iconDimensions.subText} mt-0.5 ${
                isLight ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Speisekarte & Bewertungen
            </span>
          )}
        </div>
      )}
    </div>
  );
};
