export function CoatOfArms({ className = 'w-16 h-20' }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center justify-center text-center ${className}`}>
      {/* High-fidelity Vector representation of RSA Coat of Arms */}
      <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rising Sun */}
        <path d="M100 45 L100 25 M85 50 L70 32 M115 50 L130 32 M72 62 L52 50 M128 62 L148 50" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="55" r="14" fill="#f59e0b" opacity="0.9" />

        {/* Secretary Bird (Crown & Wings) */}
        <path d="M100 50 Q110 65 125 75 Q100 85 75 75 Q90 65 100 50 Z" fill="#b45309" />
        <path d="M100 50 Q100 80 100 100" stroke="#78350f" strokeWidth="4" />
        
        {/* Wings outstretched */}
        <path d="M100 70 Q140 60 170 85 Q135 90 100 95 Q65 90 30 85 Q60 60 100 70 Z" fill="#d97706" />

        {/* Protea Flower in Center */}
        <path d="M100 85 L112 110 L100 125 L88 110 Z" fill="#dc2626" />
        <path d="M100 90 L108 108 L100 120 L92 108 Z" fill="#fef08a" />

        {/* Elephant Tusks on sides */}
        <path d="M45 150 Q30 110 50 80 Q55 105 50 140 Z" fill="#fef3c7" stroke="#78350f" strokeWidth="1.5" />
        <path d="M155 150 Q170 110 150 80 Q145 105 150 140 Z" fill="#fef3c7" stroke="#78350f" strokeWidth="1.5" />

        {/* Ears of Wheat / Spekboom */}
        <path d="M35 150 Q30 180 50 200" stroke="#15803d" strokeWidth="3" fill="none" />
        <path d="M165 150 Q170 180 150 200" stroke="#15803d" strokeWidth="3" fill="none" />

        {/* Shield */}
        <path d="M65 110 Q100 105 135 110 Q140 160 100 190 Q60 160 65 110 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="3" />
        
        {/* Figures in Khoisan Rock Art Style on Shield */}
        <g stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round">
          {/* Left figure */}
          <circle cx="85" cy="130" r="3" fill="#78350f" />
          <path d="M85 133 L85 155 M85 140 L75 148 M85 140 L92 148 M85 155 L78 170 M85 155 L90 170" />
          {/* Right figure */}
          <circle cx="115" cy="130" r="3" fill="#78350f" />
          <path d="M115 133 L115 155 M115 140 L108 148 M115 140 L125 148 M115 155 L110 170 M115 155 L122 170" />
        </g>

        {/* Crossed Spear and Knobkierie */}
        <path d="M40 110 L160 190 M160 110 L40 190" stroke="#78350f" strokeWidth="2.5" />

        {/* Motto Ribbon at Base */}
        <path d="M30 205 Q100 225 170 205 Q170 220 100 235 Q30 220 30 205 Z" fill="#15803d" stroke="#166534" strokeWidth="2" />
        <text x="100" y="222" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold" fontFamily="serif" letterSpacing="1">
          !KE E: /XARRA //KE
        </text>
      </svg>
    </div>
  );
}
