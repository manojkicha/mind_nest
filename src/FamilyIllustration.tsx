const skin = "#db9b71";
const hair = "#3d493f";
const ink = "#334137";
const blush = "#e8876a";

export default function FamilyIllustration() {
  return (
    <svg
      className="family-art"
      viewBox="-20 0 480 600"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="Cartoon of a smiling parent holding a baby while a happy child holds their hand"
    >
      <circle className="fam-sun" cx="350" cy="190" r="48" fill="#e8b76f" opacity=".85" />

      {[0, 1, 2].map((i) => (
        <path
          key={i}
          className="fam-heart"
          style={{ animationDelay: `${i * 1.6}s` }}
          transform={`translate(${[178, 292, 236][i]} ${[150, 170, 120][i]}) scale(${[0.9, 0.7, 0.55][i]})`}
          d="M0 6 C-10 -6 -22 4 -12 14 L0 26 L12 14 C22 4 10 -6 0 6 Z"
          fill="#e69b65"
        />
      ))}

      <path d="M-40 405 Q110 365 220 398 T480 385 V600 H-40 Z" fill="#b9c9b2" />
      <ellipse cx="38" cy="420" rx="22" ry="44" fill="#6d8d77" transform="rotate(-28 38 420)" />
      <ellipse cx="408" cy="415" rx="20" ry="40" fill="#8fa990" transform="rotate(26 408 415)" />
      <path d="M-40 445 Q220 418 480 445 V600 H-40 Z" fill="#8fa990" />

      <g className="fam-parent">
        {/* legs */}
        <rect x="201" y="360" width="14" height="88" rx="6" fill={hair} />
        <rect x="225" y="360" width="14" height="88" rx="6" fill={hair} />
        <ellipse cx="205" cy="450" rx="13" ry="6" fill={ink} />
        <ellipse cx="236" cy="450" rx="13" ry="6" fill={ink} />
        {/* body */}
        <path d="M190 232 Q220 218 250 232 L268 372 H172 Z" fill="#c88159" />
        <rect x="213" y="212" width="14" height="18" fill={skin} />
        {/* head */}
        <circle cx="220" cy="188" r="36" fill={skin} />
        <circle cx="220" cy="142" r="19" fill={hair} />
        <path d="M183 194 Q178 150 220 150 Q262 150 257 194 Q252 168 220 166 Q190 168 183 194 Z" fill={hair} />
        <path d="M202 192 q6 -7 12 0 M226 192 q6 -7 12 0" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M209 206 q11 10 22 0" stroke="#664b3f" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="203" cy="203" r="5" fill={blush} opacity=".45" />
        <circle cx="237" cy="203" r="5" fill={blush} opacity=".45" />
        {/* arm reaching down to the child */}
        <path d="M192 242 Q174 292 156 318" stroke={skin} strokeWidth="13" fill="none" strokeLinecap="round" />

        {/* baby in a blanket */}
        <g className="fam-baby">
          <ellipse cx="240" cy="270" rx="36" ry="24" fill="#f2c4b0" />
          <circle cx="263" cy="250" r="19" fill={skin} />
          <path d="M256 233 q5 -8 10 -2" stroke={hair} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M254 250 q4 -4 8 0 M266 250 q4 -4 8 0" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M258 259 q6 6 12 0" stroke="#664b3f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="253" cy="257" r="3.5" fill={blush} opacity=".5" />
          <circle cx="276" cy="256" r="3.5" fill={blush} opacity=".5" />
        </g>
        {/* arm cradling the baby */}
        <path d="M250 240 Q272 292 222 292" stroke={skin} strokeWidth="13" fill="none" strokeLinecap="round" />
      </g>

      <g className="fam-child">
        <rect x="114" y="392" width="11" height="56" rx="5" fill="#30483d" />
        <rect x="131" y="392" width="11" height="56" rx="5" fill="#30483d" />
        <ellipse cx="118" cy="450" rx="11" ry="5" fill={ink} />
        <ellipse cx="139" cy="450" rx="11" ry="5" fill={ink} />
        <rect x="106" y="318" width="44" height="82" rx="15" fill="#d7bb68" />
        {/* arm up to hold the parent's hand */}
        <path d="M144 332 Q152 326 154 320" stroke={skin} strokeWidth="11" fill="none" strokeLinecap="round" />
        <circle cx="155" cy="318" r="7" fill={skin} />
        <circle cx="128" cy="292" r="27" fill={skin} />
        <path d="M101 292 Q98 258 128 260 Q158 258 155 292 Q150 276 138 274 Q132 280 120 276 Q108 278 101 292 Z" fill="#5a4636" />
        <path d="M115 292 q5 -6 10 0 M132 292 q5 -6 10 0" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M117 302 q11 12 22 0 Z" fill="#664b3f" />
        <circle cx="112" cy="300" r="4" fill={blush} opacity=".45" />
        <circle cx="145" cy="300" r="4" fill={blush} opacity=".45" />
      </g>
    </svg>
  );
}
