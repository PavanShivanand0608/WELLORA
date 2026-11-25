
interface FoodArtProps {
  className?: string
  size?: number
}

/**
 * High-fidelity top-down citrus & avocado Buddha bowl
 */
export function CitrusAvocadoBowl({ className = '', size = 260 }: FoodArtProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-xl ${className}`}
      aria-label="Fresh Citrus and Avocado Buddha Bowl"
    >
      <defs>
        {/* Bowl shadows & gradients */}
        <radialGradient id="bowlGrad" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#22201E" />
          <stop offset="92%" stopColor="#181716" />
          <stop offset="100%" stopColor="#0E0D0C" />
        </radialGradient>
        <radialGradient id="quinoaBase" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#D9C2A7" />
          <stop offset="60%" stopColor="#C4AA8E" />
          <stop offset="100%" stopColor="#9C8267" />
        </radialGradient>
        <linearGradient id="avocadoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E4EDB2" />
          <stop offset="50%" stopColor="#B3CD6D" />
          <stop offset="100%" stopColor="#64882F" />
        </linearGradient>
        <radialGradient id="citrusPulp" cx="50%" cy="50%" r="50%">
          <stop offset="20%" stopColor="#FFA67A" />
          <stop offset="70%" stopColor="#FF7744" />
          <stop offset="100%" stopColor="#D94E1F" />
        </radialGradient>
        <radialGradient id="citrusPulpYellow" cx="50%" cy="50%" r="50%">
          <stop offset="20%" stopColor="#FFE066" />
          <stop offset="70%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#E68A00" />
        </radialGradient>
        <linearGradient id="salmonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9B82" />
          <stop offset="50%" stopColor="#F87158" />
          <stop offset="100%" stopColor="#D64528" />
        </linearGradient>
      </defs>

      {/* Outer plate & shadow */}
      <circle cx="150" cy="150" r="140" fill="url(#bowlGrad)" stroke="#3A3632" strokeWidth="4" />
      <circle cx="150" cy="150" r="130" fill="#282421" />

      {/* Base Grain Layer (Quinoa / Brown Rice) */}
      <circle cx="150" cy="150" r="124" fill="url(#quinoaBase)" opacity="0.95" />

      {/* Quinoa Grain Texture Dots */}
      <g opacity="0.35" fill="#755B3F">
        <circle cx="130" cy="130" r="2.5" />
        <circle cx="140" cy="120" r="2" />
        <circle cx="155" cy="135" r="2" />
        <circle cx="165" cy="125" r="2.5" />
        <circle cx="145" cy="150" r="2" />
        <circle cx="135" cy="165" r="2.5" />
        <circle cx="155" cy="165" r="2" />
        <circle cx="170" cy="150" r="2.5" />
        <circle cx="120" cy="150" r="2" />
        <circle cx="140" cy="175" r="2" />
        <circle cx="160" cy="180" r="2.5" />
        <circle cx="175" cy="170" r="2" />
      </g>

      {/* Sliced Avocado Fan (Top Left) */}
      <g transform="translate(68, 70) rotate(-15)">
        {/* Slice 1 */}
        <path
          d="M10 50 C10 25, 40 8, 70 8 C60 25, 40 45, 10 50 Z"
          fill="url(#avocadoGrad)"
          stroke="#41591B"
          strokeWidth="1.5"
        />
        {/* Slice 2 */}
        <path
          d="M18 60 C20 35, 52 14, 82 16 C70 33, 50 52, 18 60 Z"
          fill="url(#avocadoGrad)"
          stroke="#41591B"
          strokeWidth="1.5"
        />
        {/* Slice 3 */}
        <path
          d="M28 70 C30 46, 64 24, 94 28 C80 44, 60 62, 28 70 Z"
          fill="url(#avocadoGrad)"
          stroke="#41591B"
          strokeWidth="1.5"
        />
        {/* Slice 4 */}
        <path
          d="M38 80 C40 56, 75 35, 104 42 C90 57, 70 73, 38 80 Z"
          fill="url(#avocadoGrad)"
          stroke="#41591B"
          strokeWidth="1.5"
        />
      </g>

      {/* Ruby Grapefruit / Orange Wheels (Top Right & Center) */}
      <g transform="translate(155, 68)">
        <circle cx="45" cy="45" r="40" fill="#FFEFE5" stroke="#E66538" strokeWidth="3" />
        <circle cx="45" cy="45" r="36" fill="url(#citrusPulp)" />
        {/* Citrus Segment dividers */}
        <path
          d="M45 45 L45 11 M45 45 L70 21 M45 45 L79 45 M45 45 L69 69 M45 45 L45 79 M45 45 L21 69 M45 45 L11 45 M45 45 L21 21"
          stroke="#FFF0E6"
          strokeWidth="2.5"
          opacity="0.85"
        />
        <circle cx="45" cy="45" r="5" fill="#FFEFE5" />
      </g>

      {/* Second Citrus Wheel (Yellow Lemon / Orange Slice) */}
      <g transform="translate(182, 138) scale(0.75)">
        <circle cx="40" cy="40" r="38" fill="#FFF9DE" stroke="#DDA200" strokeWidth="3" />
        <circle cx="40" cy="40" r="34" fill="url(#citrusPulpYellow)" />
        <path
          d="M40 40 L40 8 M40 40 L64 16 M40 40 L72 40 M40 40 L64 64 M40 40 L40 72 M40 40 L16 64 M40 40 L8 40 M40 40 L16 16"
          stroke="#FFF9DE"
          strokeWidth="2"
          opacity="0.9"
        />
        <circle cx="40" cy="40" r="4.5" fill="#FFF9DE" />
      </g>

      {/* Edamame / Fresh Sweet Pea Clusters (Bottom Left) */}
      <g transform="translate(85, 155)">
        <ellipse cx="25" cy="25" rx="14" ry="9" fill="#75A832" stroke="#527A1F" strokeWidth="1.5" transform="rotate(-20 25 25)" />
        <ellipse cx="44" cy="22" rx="13" ry="8" fill="#88C03D" stroke="#527A1F" strokeWidth="1.5" transform="rotate(25 44 22)" />
        <ellipse cx="32" cy="40" rx="14" ry="8" fill="#69992B" stroke="#527A1F" strokeWidth="1.5" transform="rotate(45 32 40)" />
        <ellipse cx="52" cy="38" rx="12" ry="7.5" fill="#88C03D" stroke="#527A1F" strokeWidth="1.5" transform="rotate(-10 52 38)" />
        <ellipse cx="40" cy="56" rx="13" ry="8" fill="#75A832" stroke="#527A1F" strokeWidth="1.5" transform="rotate(30 40 56)" />
      </g>

      {/* Pomegranate Jewels (Scattered ruby arils) */}
      <g fill="#A81D33" stroke="#660A18" strokeWidth="0.8">
        <polygon points="145,152 150,147 154,151 150,157" />
        <polygon points="135,142 140,138 143,142 138,146" />
        <polygon points="128,168 133,164 136,168 132,173" />
        <polygon points="160,165 166,162 168,167 163,171" />
        <polygon points="172,130 177,126 180,131 176,135" />
        <polygon points="148,180 153,176 156,181 151,185" />
      </g>

      {/* Fresh Cilantro / Mint Sprigs (Center & Accents) */}
      <g stroke="#3D681C" fill="#589329" strokeWidth="1">
        <path d="M148 140 C146 128, 138 122, 132 120 C138 126, 142 134, 148 140 Z" />
        <path d="M148 140 C154 130, 164 126, 170 128 C163 134, 155 138, 148 140 Z" />
        <path d="M148 140 C144 148, 136 154, 130 155 C136 150, 144 145, 148 140 Z" />
      </g>

      {/* White / Black Toasted Sesame Seed Garnish */}
      <g fill="#FFFDF8" opacity="0.85">
        <ellipse cx="140" cy="110" rx="1.5" ry="3" transform="rotate(25 140 110)" />
        <ellipse cx="160" cy="115" rx="1.5" ry="3" transform="rotate(-30 160 115)" />
        <ellipse cx="120" cy="135" rx="1.5" ry="3" transform="rotate(40 120 135)" />
        <ellipse cx="178" cy="165" rx="1.5" ry="3" transform="rotate(-45 178 165)" />
        <ellipse cx="150" cy="195" rx="1.5" ry="3" transform="rotate(10 150 195)" />
      </g>
      <g fill="#2B2825" opacity="0.75">
        <ellipse cx="144" cy="112" rx="1.5" ry="3" transform="rotate(-15 144 112)" />
        <ellipse cx="165" cy="118" rx="1.5" ry="3" transform="rotate(35 165 118)" />
        <ellipse cx="125" cy="140" rx="1.5" ry="3" transform="rotate(-20 125 140)" />
        <ellipse cx="182" cy="160" rx="1.5" ry="3" transform="rotate(15 182 160)" />
      </g>
    </svg>
  )
}

/**
 * Top-down Rainbow Salmon Poke & Grain Bowl
 */
export function RainbowSalmonBowl({ className = '', size = 260 }: FoodArtProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-xl ${className}`}
      aria-label="Rainbow Salmon and Veggie Bowl"
    >
      <defs>
        <radialGradient id="pokeBowl" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#252422" />
          <stop offset="95%" stopColor="#171615" />
          <stop offset="100%" stopColor="#0B0B0A" />
        </radialGradient>
        <radialGradient id="riceBase" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FAF7F2" />
          <stop offset="70%" stopColor="#EDE5D8" />
          <stop offset="100%" stopColor="#D9CDBD" />
        </radialGradient>
        <linearGradient id="salmonCube" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA68F" />
          <stop offset="45%" stopColor="#FA7358" />
          <stop offset="100%" stopColor="#D94828" />
        </linearGradient>
        <linearGradient id="cabbageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9B4B88" />
          <stop offset="60%" stopColor="#752B63" />
          <stop offset="100%" stopColor="#4A143D" />
        </linearGradient>
      </defs>

      {/* Bowl */}
      <circle cx="150" cy="150" r="140" fill="url(#pokeBowl)" stroke="#3E3A35" strokeWidth="4" />
      <circle cx="150" cy="150" r="130" fill="#2D2926" />
      <circle cx="150" cy="150" r="124" fill="url(#riceBase)" />

      {/* Fresh Salmon Cubes (Top Right) */}
      <g transform="translate(145, 68)">
        <rect x="10" y="10" width="30" height="26" rx="4" fill="url(#salmonCube)" stroke="#B8391D" strokeWidth="1.2" transform="rotate(-8 25 23)" />
        <line x1="14" y1="18" x2="36" y2="15" stroke="#FFEAE5" strokeWidth="1.5" opacity="0.8" />
        <line x1="16" y1="26" x2="38" y2="23" stroke="#FFEAE5" strokeWidth="1.5" opacity="0.8" />

        <rect x="42" y="18" width="28" height="25" rx="4" fill="url(#salmonCube)" stroke="#B8391D" strokeWidth="1.2" transform="rotate(12 56 30)" />
        <line x1="46" y1="26" x2="66" y2="30" stroke="#FFEAE5" strokeWidth="1.5" opacity="0.8" />

        <rect x="22" y="42" width="32" height="26" rx="4" fill="url(#salmonCube)" stroke="#B8391D" strokeWidth="1.2" transform="rotate(5 38 55)" />
        <line x1="26" y1="50" x2="50" y2="52" stroke="#FFEAE5" strokeWidth="1.5" opacity="0.8" />

        <rect x="56" y="45" width="28" height="26" rx="4" fill="url(#salmonCube)" stroke="#B8391D" strokeWidth="1.2" transform="rotate(-15 70 58)" />
      </g>

      {/* Shredded Red Cabbage (Top Left) */}
      <g transform="translate(68, 70)">
        <path d="M15 45 Q35 15, 65 25 Q45 45, 20 60 Z" fill="url(#cabbageGrad)" />
        <path d="M25 55 Q50 20, 80 35 Q55 55, 30 75 Z" fill="url(#cabbageGrad)" opacity="0.9" />
        <path d="M35 68 Q65 30, 95 48 Q70 70, 40 85 Z" fill="url(#cabbageGrad)" opacity="0.85" />
        {/* Purple veins */}
        <path d="M30 35 Q50 25, 70 30" stroke="#E8B5DD" strokeWidth="1.2" fill="none" opacity="0.7" />
        <path d="M40 45 Q60 38, 85 42" stroke="#E8B5DD" strokeWidth="1.2" fill="none" opacity="0.7" />
      </g>

      {/* Fresh Cucumber Ribbons (Bottom Left) */}
      <g transform="translate(75, 145)">
        <circle cx="28" cy="28" r="18" fill="#D9F0BA" stroke="#689E28" strokeWidth="2.5" />
        <circle cx="28" cy="28" r="10" fill="#E8F7D2" stroke="#A4CE6F" strokeWidth="1" strokeDasharray="2 3" />

        <circle cx="50" cy="45" r="18" fill="#D9F0BA" stroke="#689E28" strokeWidth="2.5" />
        <circle cx="50" cy="45" r="10" fill="#E8F7D2" stroke="#A4CE6F" strokeWidth="1" strokeDasharray="2 3" />

        <circle cx="30" cy="62" r="17" fill="#D9F0BA" stroke="#689E28" strokeWidth="2.5" />
        <circle cx="30" cy="62" r="9" fill="#E8F7D2" stroke="#A4CE6F" strokeWidth="1" strokeDasharray="2 3" />
      </g>

      {/* Steamed Edamame & Corn Kernels (Bottom Right) */}
      <g transform="translate(150, 150)">
        {/* Edamame */}
        <ellipse cx="25" cy="30" rx="10" ry="6" fill="#88C03D" stroke="#507A1D" strokeWidth="1.2" transform="rotate(-30 25 30)" />
        <ellipse cx="42" cy="24" rx="9" ry="5.5" fill="#75A832" stroke="#507A1D" strokeWidth="1.2" transform="rotate(15 42 24)" />
        <ellipse cx="38" cy="44" rx="10" ry="6" fill="#88C03D" stroke="#507A1D" strokeWidth="1.2" transform="rotate(40 38 44)" />
        <ellipse cx="55" cy="38" rx="9" ry="5.5" fill="#75A832" stroke="#507A1D" strokeWidth="1.2" transform="rotate(-10 55 38)" />

        {/* Sweet Corn */}
        <circle cx="20" cy="50" r="4.5" fill="#FFC933" stroke="#D49A00" strokeWidth="1" />
        <circle cx="30" cy="60" r="4" fill="#FFD454" stroke="#D49A00" strokeWidth="1" />
        <circle cx="48" cy="56" r="4.5" fill="#FFC933" stroke="#D49A00" strokeWidth="1" />
        <circle cx="62" cy="50" r="4" fill="#FFD454" stroke="#D49A00" strokeWidth="1" />
      </g>

      {/* Furikake / Sesame Garnish */}
      <g fill="#1F1D1A" opacity="0.8">
        <ellipse cx="148" cy="140" rx="1.5" ry="3" transform="rotate(30 148 140)" />
        <ellipse cx="156" cy="132" rx="1.5" ry="3" transform="rotate(-40 156 132)" />
        <ellipse cx="140" cy="148" rx="1.5" ry="3" transform="rotate(10 140 148)" />
      </g>
    </svg>
  )
}

/**
 * Top-down Berry Chia Breakfast Smoothie Bowl
 */
export function BerryChiaBowl({ className = '', size = 260 }: FoodArtProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-xl ${className}`}
      aria-label="Berry Chia Breakfast Smoothie Bowl"
    >
      <defs>
        <radialGradient id="smoothieBowl" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#2A2228" />
          <stop offset="95%" stopColor="#1A1418" />
          <stop offset="100%" stopColor="#0E0A0D" />
        </radialGradient>
        <radialGradient id="acaiBase" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7E2863" />
          <stop offset="60%" stopColor="#5E1647" />
          <stop offset="100%" stopColor="#3C0B2C" />
        </radialGradient>
        <linearGradient id="strawberryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5C6C" />
          <stop offset="60%" stopColor="#EB1E38" />
          <stop offset="100%" stopColor="#A8071D" />
        </linearGradient>
      </defs>

      {/* Bowl */}
      <circle cx="150" cy="150" r="140" fill="url(#smoothieBowl)" stroke="#4A3845" strokeWidth="4" />
      <circle cx="150" cy="150" r="130" fill="#332430" />
      <circle cx="150" cy="150" r="124" fill="url(#acaiBase)" />

      {/* Sliced Strawberries fan (Top Left to Right) */}
      <g transform="translate(70, 75)">
        {/* Strawberry 1 */}
        <path
          d="M20 20 C35 5, 55 15, 50 35 C45 50, 25 55, 15 40 Z"
          fill="url(#strawberryGrad)"
          stroke="#940517"
          strokeWidth="1.2"
          transform="rotate(-15 35 30)"
        />
        <circle cx="32" cy="28" r="1.2" fill="#FFEAEA" />
        <circle cx="38" cy="35" r="1.2" fill="#FFEAEA" />
        <circle cx="28" cy="40" r="1.2" fill="#FFEAEA" />

        {/* Strawberry 2 */}
        <path
          d="M48 24 C63 9, 83 19, 78 39 C73 54, 53 59, 43 44 Z"
          fill="url(#strawberryGrad)"
          stroke="#940517"
          strokeWidth="1.2"
          transform="rotate(10 60 34)"
        />
        <circle cx="58" cy="32" r="1.2" fill="#FFEAEA" />
        <circle cx="66" cy="39" r="1.2" fill="#FFEAEA" />

        {/* Strawberry 3 */}
        <path
          d="M78 35 C93 20, 113 30, 108 50 C103 65, 83 70, 73 55 Z"
          fill="url(#strawberryGrad)"
          stroke="#940517"
          strokeWidth="1.2"
          transform="rotate(30 90 45)"
        />
      </g>

      {/* Fresh Blueberries (Arc across middle) */}
      <g>
        <circle cx="110" cy="145" r="11" fill="#2E417A" stroke="#1A274E" strokeWidth="1.5" />
        <circle cx="108" cy="143" r="3" fill="#677EC4" opacity="0.6" />

        <circle cx="132" cy="152" r="12" fill="#27386B" stroke="#1A274E" strokeWidth="1.5" />
        <circle cx="130" cy="150" r="3.5" fill="#677EC4" opacity="0.6" />

        <circle cx="156" cy="154" r="11" fill="#324785" stroke="#1A274E" strokeWidth="1.5" />
        <circle cx="154" cy="152" r="3" fill="#677EC4" opacity="0.6" />

        <circle cx="180" cy="150" r="11.5" fill="#2E417A" stroke="#1A274E" strokeWidth="1.5" />
        <circle cx="178" cy="148" r="3" fill="#677EC4" opacity="0.6" />
      </g>

      {/* Banana Coins (Bottom section) */}
      <g transform="translate(85, 170)">
        <circle cx="28" cy="28" r="14" fill="#FFF2BD" stroke="#DEBA49" strokeWidth="1.5" />
        <path d="M25 28 L31 28 M28 25 L28 31" stroke="#BA9525" strokeWidth="1.5" strokeLinecap="round" />

        <circle cx="50" cy="38" r="14" fill="#FFF2BD" stroke="#DEBA49" strokeWidth="1.5" />
        <path d="M47 38 L53 38 M50 35 L50 41" stroke="#BA9525" strokeWidth="1.5" strokeLinecap="round" />

        <circle cx="75" cy="40" r="14" fill="#FFF2BD" stroke="#DEBA49" strokeWidth="1.5" />
        <path d="M72 40 L78 40 M75 37 L75 43" stroke="#BA9525" strokeWidth="1.5" strokeLinecap="round" />

        <circle cx="100" cy="32" r="14" fill="#FFF2BD" stroke="#DEBA49" strokeWidth="1.5" />
        <path d="M97 32 L103 32 M100 29 L100 35" stroke="#BA9525" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Chia Seed & Coconut Flake Strip */}
      <g fill="#242220">
        <circle cx="115" cy="122" r="1.2" />
        <circle cx="122" cy="120" r="1.4" />
        <circle cx="130" cy="124" r="1.2" />
        <circle cx="140" cy="122" r="1.5" />
        <circle cx="150" cy="126" r="1.3" />
        <circle cx="160" cy="124" r="1.4" />
        <circle cx="172" cy="128" r="1.2" />
      </g>
      <g fill="#FFF9F2" opacity="0.85">
        <path d="M125 116 Q130 114, 134 117" stroke="#FFF9F2" strokeWidth="2" strokeLinecap="round" />
        <path d="M145 118 Q150 115, 155 119" stroke="#FFF9F2" strokeWidth="2" strokeLinecap="round" />
        <path d="M165 120 Q170 117, 175 121" stroke="#FFF9F2" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}
