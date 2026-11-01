import { PresetScenario } from '../types';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'urban-crosswalk-billboard',
    title: 'Urban Crosswalk & Saliency Billboard',
    category: 'Commercial Visual Noise',
    description: 'A pedestrian is stepping onto a pedestrian zebra crossing while an eye-catching neon promotional electronic billboard looms directly above.',
    researchHypothesis: 'High-luminance commercial billboards distract spatial attention from subtle pedestrian leg strides and gaze cues, causing delayed intent detection.',
    cleanPromptCue: 'Standard urban intersection with a pedestrian at zebra crossing looking toward oncoming vehicle.',
    distractedPromptCue: 'Same intersection, but a massive ultra-bright flashing LED billboard advertising a mega sale sits directly above the crosswalk.',
    cleanSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <defs>
        <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </linearGradient>
        <linearGradient id="road1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <!-- Background & Sky -->
      <rect width="800" height="500" fill="url(#sky1)"/>
      <!-- Distant City Skyline -->
      <rect x="50" y="140" width="80" height="180" fill="#334155"/>
      <rect x="150" y="100" width="110" height="220" fill="#1e293b"/>
      <rect x="280" y="160" width="90" height="160" fill="#334155"/>
      <rect x="480" y="120" width="120" height="200" fill="#1e293b"/>
      <rect x="620" y="150" width="130" height="170" fill="#334155"/>
      <!-- Windows in buildings -->
      <g fill="#cbd5e1" opacity="0.4">
        <rect x="165" y="120" width="10" height="15"/>
        <rect x="190" y="120" width="10" height="15"/>
        <rect x="215" y="120" width="10" height="15"/>
        <rect x="165" y="150" width="10" height="15"/>
        <rect x="190" y="150" width="10" height="15"/>
        <rect x="215" y="150" width="10" height="15"/>
      </g>
      <!-- Sidewalk / Curb -->
      <polygon points="0,320 800,320 800,350 0,350" fill="#94a3b8"/>
      <polygon points="0,350 800,350 800,360 0,360" fill="#64748b"/>
      <!-- Roadway -->
      <polygon points="0,360 800,360 800,500 0,500" fill="url(#road1)"/>
      <!-- Zebra Crossing Stripes -->
      <g fill="#f8fafc">
        <polygon points="180,365 240,365 220,490 150,490"/>
        <polygon points="270,365 330,365 320,490 250,490"/>
        <polygon points="360,365 420,365 420,490 350,490"/>
        <polygon points="450,365 510,365 520,490 450,490"/>
        <polygon points="540,365 600,365 620,490 550,490"/>
      </g>
      <!-- Traffic Light Pole & Signal (Green Pedestrian Walk) -->
      <rect x="100" y="180" width="10" height="170" fill="#475569"/>
      <rect x="90" y="190" width="30" height="60" rx="4" fill="#0f172a"/>
      <circle cx="105" cy="205" r="7" fill="#334155"/>
      <circle cx="105" cy="235" r="7" fill="#22c55e"/> <!-- Green Walk Signal -->
      <!-- Standard neutral building signage -->
      <rect x="470" y="190" width="140" height="30" fill="#475569" rx="3"/>
      <text x="540" y="210" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">CITY LIBRARY</text>
      <!-- Pedestrian at crosswalk (Stepping forward, looking at traffic) -->
      <g id="pedestrian">
        <!-- Head -->
        <circle cx="340" cy="275" r="14" fill="#fcd34d"/>
        <!-- Hair/hat -->
        <path d="M 326 270 Q 340 255 354 270 Z" fill="#1e293b"/>
        <!-- Torso (Navy Jacket) -->
        <rect x="328" y="289" width="24" height="42" rx="4" fill="#2563eb"/>
        <!-- Arm reaching forward slightly -->
        <line x1="332" y1="295" x2="320" y2="320" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/>
        <line x1="346" y1="295" x2="355" y2="315" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/>
        <!-- Pants / Legs in forward stride (entering crosswalk) -->
        <line x1="334" y1="331" x2="318" y2="378" stroke="#334155" stroke-width="7" stroke-linecap="round"/>
        <line x1="346" y1="331" x2="362" y2="372" stroke="#334155" stroke-width="7" stroke-linecap="round"/>
        <!-- Shoes -->
        <ellipse cx="314" cy="380" rx="7" ry="4" fill="#0f172a"/>
        <ellipse cx="365" cy="374" rx="7" ry="4" fill="#0f172a"/>
      </g>
      <!-- Lane markings -->
      <line x1="50" y1="430" x2="100" y2="430" stroke="#facc15" stroke-width="4"/>
      <line x1="680" y1="430" x2="740" y2="430" stroke="#facc15" stroke-width="4"/>
    </svg>`,
    distractedSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <defs>
        <linearGradient id="sky1b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </linearGradient>
        <linearGradient id="road1b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <linearGradient id="billboardGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ec4899"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#8b5cf6"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#sky1b)"/>
      <rect x="50" y="140" width="80" height="180" fill="#334155"/>
      <rect x="150" y="100" width="110" height="220" fill="#1e293b"/>
      <rect x="280" y="160" width="90" height="160" fill="#334155"/>
      <rect x="480" y="120" width="120" height="200" fill="#1e293b"/>
      <rect x="620" y="150" width="130" height="170" fill="#334155"/>
      
      <!-- DISTRACTOR: Massive Glowing LED Billboard suspended right above pedestrian crossing -->
      <g id="distractor-billboard">
        <!-- Billboard Support Gantry -->
        <rect x="220" y="90" width="12" height="230" fill="#1e293b"/>
        <rect x="440" y="90" width="12" height="230" fill="#1e293b"/>
        <line x1="220" y1="120" x2="450" y2="120" stroke="#0f172a" stroke-width="8"/>
        <!-- Huge Pulsing Colorful Billboard Canvas -->
        <rect x="200" y="40" width="280" height="120" rx="8" fill="url(#billboardGlow)" stroke="#fef08a" stroke-width="5"/>
        <rect x="210" y="50" width="260" height="100" rx="4" fill="#09090b" opacity="0.85"/>
        <!-- Flashing Ads Content -->
        <text x="340" y="80" fill="#f43f5e" font-family="'Impact', sans-serif" font-size="26" text-anchor="middle" font-weight="900" letter-spacing="2">⚠️ FLASH SALE! 90% OFF ⚠️</text>
        <text x="340" y="108" fill="#38bdf8" font-family="sans-serif" font-size="16" text-anchor="middle" font-weight="bold">CLICK NOW FOR FREE CAR</text>
        <rect x="280" y="118" width="120" height="24" rx="12" fill="#e11d48"/>
        <text x="340" y="134" fill="#ffffff" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">BUY TICKETS NOW</text>
      </g>
      
      <!-- Sidewalk / Curb -->
      <polygon points="0,320 800,320 800,350 0,350" fill="#94a3b8"/>
      <polygon points="0,350 800,350 800,360 0,360" fill="#64748b"/>
      <!-- Roadway -->
      <polygon points="0,360 800,360 800,500 0,500" fill="url(#road1b)"/>
      <!-- Zebra Crossing Stripes -->
      <g fill="#f8fafc">
        <polygon points="180,365 240,365 220,490 150,490"/>
        <polygon points="270,365 330,365 320,490 250,490"/>
        <polygon points="360,365 420,365 420,490 350,490"/>
        <polygon points="450,365 510,365 520,490 450,490"/>
        <polygon points="540,365 600,365 620,490 550,490"/>
      </g>
      
      <!-- Same Pedestrian at crosswalk -->
      <g id="pedestrian-same">
        <circle cx="340" cy="275" r="14" fill="#fcd34d"/>
        <path d="M 326 270 Q 340 255 354 270 Z" fill="#1e293b"/>
        <rect x="328" y="289" width="24" height="42" rx="4" fill="#2563eb"/>
        <line x1="332" y1="295" x2="320" y2="320" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/>
        <line x1="346" y1="295" x2="355" y2="315" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/>
        <line x1="334" y1="331" x2="318" y2="378" stroke="#334155" stroke-width="7" stroke-linecap="round"/>
        <line x1="346" y1="331" x2="362" y2="372" stroke="#334155" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="314" cy="380" rx="7" ry="4" fill="#0f172a"/>
        <ellipse cx="365" cy="374" rx="7" ry="4" fill="#0f172a"/>
      </g>
    </svg>`,
  },
  {
    id: 'school-zone-balloons',
    title: 'School Zone Curb & Floating Inflatable Distractors',
    category: 'Handheld & Novelty Objects',
    description: 'A young child pedestrian is waiting on the sidewalk curb near an elementary school zone. In the perturbed trial, a nearby bystander holds a cluster of bright metallic balloons and an umbrella.',
    researchHypothesis: 'Non-rigid colorful objects (balloons, umbrellas) alter bounding box confidence and can trigger false intent classification or obscure posture cues.',
    cleanPromptCue: 'Child pedestrian standing near sidewalk curb looking towards the road in a 30 km/h school zone.',
    distractedPromptCue: 'Same child pedestrian, but directly beside them is a bright cluster of floating metallic helium party balloons and a colorful parasol.',
    cleanSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#e0f2fe"/>
      <!-- School Building in background -->
      <rect x="60" y="160" width="400" height="180" fill="#b91c1c"/>
      <polygon points="50,160 260,80 470,160" fill="#7f1d1d"/>
      <rect x="230" y="100" width="60" height="40" rx="2" fill="#f8fafc"/>
      <text x="260" y="125" fill="#0f172a" font-family="sans-serif" font-size="14" text-anchor="middle" font-weight="bold">SCHOOL</text>
      <!-- School Zone Yellow Road Sign -->
      <polygon points="120,240 160,200 200,240 160,280" fill="#facc15" stroke="#000" stroke-width="3"/>
      <text x="160" y="246" fill="#000" font-family="sans-serif" font-size="14" text-anchor="middle" font-weight="900">SLOW</text>
      <rect x="157" y="280" width="6" height="80" fill="#64748b"/>
      <!-- Sidewalk -->
      <rect x="0" y="340" width="800" height="60" fill="#cbd5e1"/>
      <line x1="0" y1="400" x2="800" y2="400" stroke="#64748b" stroke-width="6"/>
      <!-- Asphalt Road -->
      <rect x="0" y="400" width="800" height="100" fill="#334155"/>
      <line x1="0" y1="450" x2="800" y2="450" stroke="#facc15" stroke-width="4" stroke-dasharray="25, 20"/>
      <!-- Child Pedestrian standing attentively by curb edge -->
      <g id="child-ped">
        <!-- Head / Backpack -->
        <circle cx="500" cy="305" r="12" fill="#fed7aa"/>
        <path d="M 488 300 Q 500 286 512 300 Z" fill="#451a03"/>
        <!-- Backpack (red) -->
        <rect x="484" y="316" width="10" height="22" rx="3" fill="#ef4444"/>
        <!-- Torso (Yellow hoodie) -->
        <rect x="492" y="316" width="18" height="34" rx="4" fill="#eab308"/>
        <!-- Arms at side -->
        <line x1="492" y1="322" x2="488" y2="346" stroke="#ca8a04" stroke-width="4"/>
        <line x1="510" y1="322" x2="512" y2="346" stroke="#ca8a04" stroke-width="4"/>
        <!-- Pants (Denim blue) -->
        <line x1="497" y1="350" x2="497" y2="395" stroke="#1d4ed8" stroke-width="5" stroke-linecap="round"/>
        <line x1="506" y1="350" x2="506" y2="395" stroke="#1d4ed8" stroke-width="5" stroke-linecap="round"/>
        <!-- Shoes right on curb line -->
        <ellipse cx="497" cy="397" rx="6" ry="3" fill="#0f172a"/>
        <ellipse cx="507" cy="397" rx="6" ry="3" fill="#0f172a"/>
      </g>
    </svg>`,
    distractedSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#e0f2fe"/>
      <rect x="60" y="160" width="400" height="180" fill="#b91c1c"/>
      <polygon points="50,160 260,80 470,160" fill="#7f1d1d"/>
      <rect x="230" y="100" width="60" height="40" rx="2" fill="#f8fafc"/>
      <text x="260" y="125" fill="#0f172a" font-family="sans-serif" font-size="14" text-anchor="middle" font-weight="bold">SCHOOL</text>
      <!-- School Zone Yellow Sign -->
      <polygon points="120,240 160,200 200,240 160,280" fill="#facc15" stroke="#000" stroke-width="3"/>
      <text x="160" y="246" fill="#000" font-family="sans-serif" font-size="14" text-anchor="middle" font-weight="900">SLOW</text>
      <rect x="157" y="280" width="6" height="80" fill="#64748b"/>
      <!-- Sidewalk & Road -->
      <rect x="0" y="340" width="800" height="60" fill="#cbd5e1"/>
      <line x1="0" y1="400" x2="800" y2="400" stroke="#64748b" stroke-width="6"/>
      <rect x="0" y="400" width="800" height="100" fill="#334155"/>
      <line x1="0" y1="450" x2="800" y2="450" stroke="#facc15" stroke-width="4" stroke-dasharray="25, 20"/>
      
      <!-- DISTRACTOR: High-contrast Floating Foil Balloons & Neon Mascot Umbrella right next to the child -->
      <g id="distractor-balloons">
        <!-- Balloon Strings -->
        <path d="M 500 330 Q 520 250 540 180" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
        <path d="M 500 330 Q 545 240 570 170" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
        <path d="M 500 330 Q 560 250 590 190" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
        <!-- Bright shiny metallic balloons -->
        <circle cx="540" cy="175" r="28" fill="#f43f5e" stroke="#fda4af" stroke-width="3"/>
        <circle cx="570" cy="165" r="26" fill="#06b6d4" stroke="#a5f3fc" stroke-width="3"/>
        <circle cx="590" cy="188" r="24" fill="#a855f7" stroke="#e9d5ff" stroke-width="3"/>
        <polygon points="536,203 544,203 540,207" fill="#f43f5e"/>
        <!-- Star shaped foil balloon with shiny reflective glare -->
        <polygon points="560,110 568,128 588,128 572,140 578,158 560,146 542,158 548,140 532,128 552,128" fill="#eab308" stroke="#fef08a" stroke-width="2"/>
        <text x="560" y="142" font-size="10" font-family="sans-serif" font-weight="900" fill="#000" text-anchor="middle">SALE!</text>
      </g>
      
      <!-- Same Child Pedestrian -->
      <g id="child-ped-dist">
        <circle cx="500" cy="305" r="12" fill="#fed7aa"/>
        <path d="M 488 300 Q 500 286 512 300 Z" fill="#451a03"/>
        <rect x="484" y="316" width="10" height="22" rx="3" fill="#ef4444"/>
        <rect x="492" y="316" width="18" height="34" rx="4" fill="#eab308"/>
        <line x1="492" y1="322" x2="488" y2="346" stroke="#ca8a04" stroke-width="4"/>
        <line x1="510" y1="322" x2="512" y2="346" stroke="#ca8a04" stroke-width="4"/>
        <line x1="497" y1="350" x2="497" y2="395" stroke="#1d4ed8" stroke-width="5" stroke-linecap="round"/>
        <line x1="506" y1="350" x2="506" y2="395" stroke="#1d4ed8" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="497" cy="397" rx="6" ry="3" fill="#0f172a"/>
        <ellipse cx="507" cy="397" rx="6" ry="3" fill="#0f172a"/>
      </g>
    </svg>`,
  },
  {
    id: 'night-crosswalk-glare',
    title: 'Night Crossing & Optical Glare Distraction',
    category: 'Adverse Lighting & Glare',
    description: 'A pedestrian is crossing a dimly illuminated roadway at dusk. In the perturbed trial, intense headlamp glare and vibrant flashing commercial neon signage creates optical blooming.',
    researchHypothesis: 'Non-standard photometric disturbances degrade contour extraction and cause the model to miss pedestrians completely or misinterpret gait.',
    cleanPromptCue: 'Nighttime roadway with streetlamp overhead illuminating a pedestrian walking across the road.',
    distractedPromptCue: 'Same scene with blinding reflective light glare, flashing red neon storefront sign, and lens flare covering part of the pedestrian silhouette.',
    cleanSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#090d16"/>
      <!-- Distant dark buildings -->
      <rect x="100" y="180" width="140" height="180" fill="#111827"/>
      <rect x="280" y="140" width="180" height="220" fill="#0f172a"/>
      <rect x="520" y="190" width="160" height="170" fill="#111827"/>
      <!-- Streetlamp Pole and warm light cone -->
      <path d="M 380 120 Q 380 80 430 80 L 440 90" stroke="#475569" stroke-width="8" fill="none"/>
      <rect x="376" y="120" width="8" height="240" fill="#334155"/>
      <!-- Light fixture -->
      <polygon points="420,85 450,85 445,95 425,95" fill="#fef08a"/>
      <!-- Light cone casting down on street -->
      <polygon points="435,95 240,460 620,460" fill="#fef08a" opacity="0.12"/>
      <!-- Road Surface -->
      <rect x="0" y="360" width="800" height="140" fill="#0b0f19"/>
      <!-- White crossing marks -->
      <g fill="#94a3b8" opacity="0.7">
        <rect x="220" y="380" width="60" height="12"/>
        <rect x="310" y="380" width="60" height="12"/>
        <rect x="400" y="380" width="60" height="12"/>
        <rect x="490" y="380" width="60" height="12"/>
      </g>
      <!-- Pedestrian crossing in the streetlamp cone -->
      <g id="night-ped">
        <!-- Head illuminated from above -->
        <circle cx="430" cy="305" r="13" fill="#fed7aa"/>
        <path d="M 420 298 Q 430 286 440 298 Z" fill="#374151"/>
        <!-- Dark gray coat -->
        <rect x="420" y="318" width="22" height="46" rx="4" fill="#475569"/>
        <!-- Walking stride in roadway -->
        <line x1="424" y1="364" x2="408" y2="422" stroke="#1f2937" stroke-width="7" stroke-linecap="round"/>
        <line x1="436" y1="364" x2="450" y2="415" stroke="#1f2937" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="405" cy="423" rx="7" ry="4" fill="#000"/>
        <ellipse cx="452" cy="417" rx="7" ry="4" fill="#000"/>
      </g>
    </svg>`,
    distractedSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <defs>
        <radialGradient id="glare1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="25%" stop-color="#38bdf8" stop-opacity="0.8"/>
          <stop offset="60%" stop-color="#818cf8" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="#090d16"/>
      <rect x="100" y="180" width="140" height="180" fill="#111827"/>
      <rect x="280" y="140" width="180" height="220" fill="#0f172a"/>
      <rect x="520" y="190" width="160" height="170" fill="#111827"/>
      
      <!-- DISTRACTOR: Blinding Flashing Neon Signboard & Optical Glare Bloom -->
      <g id="distractor-neon">
        <rect x="500" y="150" width="180" height="50" rx="6" fill="#e11d48" stroke="#ffe4e6" stroke-width="3"/>
        <text x="590" y="182" fill="#ffffff" font-family="'Courier New', monospace" font-size="20" font-weight="900" text-anchor="middle">24HR CASINO</text>
        <!-- Blinding optical flare star burst directly intersecting viewing line -->
        <circle cx="490" cy="270" r="110" fill="url(#glare1)"/>
        <line x1="330" y1="270" x2="650" y2="270" stroke="#ffffff" stroke-width="3" opacity="0.8"/>
        <line x1="490" y1="120" x2="490" y2="420" stroke="#ffffff" stroke-width="3" opacity="0.8"/>
        <line x1="380" y1="160" x2="600" y2="380" stroke="#67e8f9" stroke-width="2" opacity="0.6"/>
      </g>
      
      <!-- Streetlamp & Road -->
      <path d="M 380 120 Q 380 80 430 80 L 440 90" stroke="#475569" stroke-width="8" fill="none"/>
      <rect x="376" y="120" width="8" height="240" fill="#334155"/>
      <polygon points="420,85 450,85 445,95 425,95" fill="#fef08a"/>
      <polygon points="435,95 240,460 620,460" fill="#fef08a" opacity="0.12"/>
      <rect x="0" y="360" width="800" height="140" fill="#0b0f19"/>
      <g fill="#94a3b8" opacity="0.7">
        <rect x="220" y="380" width="60" height="12"/>
        <rect x="310" y="380" width="60" height="12"/>
        <rect x="400" y="380" width="60" height="12"/>
        <rect x="490" y="380" width="60" height="12"/>
      </g>
      
      <!-- Pedestrian crossing (same position, partially washed out by flare) -->
      <g id="night-ped-dist">
        <circle cx="430" cy="305" r="13" fill="#fed7aa"/>
        <path d="M 420 298 Q 430 286 440 298 Z" fill="#374151"/>
        <rect x="420" y="318" width="22" height="46" rx="4" fill="#475569"/>
        <line x1="424" y1="364" x2="408" y2="422" stroke="#1f2937" stroke-width="7" stroke-linecap="round"/>
        <line x1="436" y1="364" x2="450" y2="415" stroke="#1f2937" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="405" cy="423" rx="7" ry="4" fill="#000"/>
        <ellipse cx="452" cy="417" rx="7" ry="4" fill="#000"/>
      </g>
    </svg>`,
  },
  {
    id: 'suburban-jogger-inflatable',
    title: 'Sidewalk Jogger & Giant Inflatable Mascot',
    category: 'Biomorphic Physical Distractors',
    description: 'An athletic jogger is running down the sidewalk and decelerating at the intersection corner. In the perturbed trial, a car dealership inflates a 14-foot waving tube man right beside the sidewalk.',
    researchHypothesis: 'Anthropomorphic or waving physical distractors trigger false-positive human pose detections, confusing intent estimation with secondary artificial motion cues.',
    cleanPromptCue: 'Jogger in athletic running apparel approaching street corner on a residential sidewalk.',
    distractedPromptCue: 'Same jogger on sidewalk, but directly beside them is a giant waving red inflatable tube man (skydancer mascot) with flailing arms.',
    cleanSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#f0fdf4"/>
      <!-- Green lawns and suburban trees -->
      <rect x="0" y="240" width="800" height="120" fill="#86efac"/>
      <circle cx="120" cy="220" r="50" fill="#15803d"/>
      <circle cx="700" cy="200" r="60" fill="#166534"/>
      <!-- Sidewalk -->
      <polygon points="0,320 800,320 800,370 0,370" fill="#e2e8f0"/>
      <!-- Curb and street -->
      <rect x="0" y="370" width="800" height="130" fill="#475569"/>
      <line x1="0" y1="435" x2="800" y2="435" stroke="#ffffff" stroke-width="3" stroke-dasharray="20, 15"/>
      <!-- Stop sign on corner -->
      <polygon points="680,240 705,225 730,240 730,270 705,285 680,270" fill="#dc2626" stroke="#fff" stroke-width="2"/>
      <text x="705" y="260" fill="#fff" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">STOP</text>
      <rect x="703" y="285" width="4" height="60" fill="#94a3b8"/>
      <!-- Jogger in motion -->
      <g id="jogger">
        <circle cx="380" cy="270" r="13" fill="#fcd34d"/>
        <path d="M 370 265 Q 380 252 390 265 Z" fill="#0f172a"/>
        <!-- Sport sunglasses -->
        <line x1="382" y1="268" x2="392" y2="268" stroke="#0284c7" stroke-width="3"/>
        <!-- Bright orange running shirt -->
        <rect x="372" y="283" width="20" height="38" rx="4" fill="#f97316"/>
        <!-- Pumped running arms -->
        <line x1="372" y1="290" x2="360" y2="305" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>
        <line x1="360" y1="305" x2="370" y2="315" stroke="#fcd34d" stroke-width="4" stroke-linecap="round"/>
        <line x1="392" y1="290" x2="405" y2="300" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>
        <!-- Running shorts & athletic stride -->
        <rect x="373" y="321" width="18" height="15" fill="#1e293b"/>
        <line x1="375" y1="336" x2="355" y2="370" stroke="#fcd34d" stroke-width="5" stroke-linecap="round"/>
        <line x1="355" y1="370" x2="340" y2="385" stroke="#fcd34d" stroke-width="5" stroke-linecap="round"/>
        <line x1="387" y1="336" x2="405" y2="365" stroke="#fcd34d" stroke-width="5" stroke-linecap="round"/>
        <line x1="405" y1="365" x2="422" y2="378" stroke="#fcd34d" stroke-width="5" stroke-linecap="round"/>
        <!-- Running shoes -->
        <ellipse cx="335" cy="386" rx="8" ry="4" fill="#22c55e"/>
        <ellipse cx="426" cy="380" rx="8" ry="4" fill="#22c55e"/>
      </g>
    </svg>`,
    distractedSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#f0fdf4"/>
      <rect x="0" y="240" width="800" height="120" fill="#86efac"/>
      <circle cx="120" cy="220" r="50" fill="#15803d"/>
      <circle cx="700" cy="200" r="60" fill="#166534"/>
      <polygon points="0,320 800,320 800,370 0,370" fill="#e2e8f0"/>
      <rect x="0" y="370" width="800" height="130" fill="#475569"/>
      <line x1="0" y1="435" x2="800" y2="435" stroke="#ffffff" stroke-width="3" stroke-dasharray="20, 15"/>
      <polygon points="680,240 705,225 730,240 730,270 705,285 680,270" fill="#dc2626" stroke="#fff" stroke-width="2"/>
      <text x="705" y="260" fill="#fff" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">STOP</text>
      <rect x="703" y="285" width="4" height="60" fill="#94a3b8"/>
      
      <!-- DISTRACTOR: Giant Flailing Wavy Tube Mascot / Skydancer on the sidewalk -->
      <g id="distractor-tubeman">
        <!-- Blower fan at base -->
        <rect x="470" y="325" width="40" height="25" rx="3" fill="#1e293b"/>
        <!-- Waving serpentine body -->
        <path d="M 490 325 Q 510 240 470 170 T 520 80" stroke="#dc2626" stroke-width="26" stroke-linecap="round" fill="none"/>
        <!-- Waving tubular arms -->
        <path d="M 480 180 Q 420 160 410 110" stroke="#dc2626" stroke-width="14" stroke-linecap="round" fill="none"/>
        <path d="M 480 180 Q 560 160 580 120" stroke="#dc2626" stroke-width="14" stroke-linecap="round" fill="none"/>
        <!-- Animated cartoon face on tube man top -->
        <circle cx="520" cy="80" r="16" fill="#facc15"/>
        <circle cx="515" cy="76" r="3" fill="#000"/>
        <circle cx="525" cy="76" r="3" fill="#000"/>
        <path d="M 512 85 Q 520 95 528 85" stroke="#000" stroke-width="2" fill="none"/>
        <!-- Fringed hair/streamers -->
        <line x1="510" y1="64" x2="505" y2="45" stroke="#eab308" stroke-width="3"/>
        <line x1="520" y1="64" x2="520" y2="40" stroke="#eab308" stroke-width="3"/>
        <line x1="530" y1="64" x2="535" y2="45" stroke="#eab308" stroke-width="3"/>
      </g>
      
      <!-- Same Jogger in motion -->
      <g id="jogger-same">
        <circle cx="380" cy="270" r="13" fill="#fcd34d"/>
        <path d="M 370 265 Q 380 252 390 265 Z" fill="#0f172a"/>
        <line x1="382" y1="268" x2="392" y2="268" stroke="#0284c7" stroke-width="3"/>
        <rect x="372" y="283" width="20" height="38" rx="4" fill="#f97316"/>
        <line x1="372" y1="290" x2="360" y2="305" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>
        <line x1="360" y1="305" x2="370" y2="315" stroke="#fcd34d" stroke-width="4" stroke-linecap="round"/>
        <line x1="392" y1="290" x2="405" y2="300" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>
        <rect x="373" y="321" width="18" height="15" fill="#1e293b"/>
        <line x1="375" y1="336" x2="355" y2="370" stroke="#fcd34d" stroke-width="5" stroke-linecap="round"/>
        <line x1="355" y1="370" x2="340" y2="385" stroke="#fcd34d" stroke-width="5" stroke-linecap="round"/>
        <line x1="387" y1="336" x2="405" y2="365" stroke="#fcd34d" stroke-width="5" stroke-linecap="round"/>
        <line x1="405" y1="365" x2="422" y2="378" stroke="#fcd34d" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="335" cy="386" rx="8" ry="4" fill="#22c55e"/>
        <ellipse cx="426" cy="380" rx="8" ry="4" fill="#22c55e"/>
      </g>
    </svg>`,
  },
];
