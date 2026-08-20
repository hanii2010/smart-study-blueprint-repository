import { type ReactNode } from 'react';

/**
 * Neon SVG icon system — custom glowing shapes instead of emojis.
 * Each icon is a self-contained SVG with gradient fills and glow filters.
 */

export type IconName =
  | 'circle'
  | 'triangle'
  | 'square'
  | 'diamond'
  | 'hexagon'
  | 'star'
  | 'bolt'
  | 'heart'
  | 'orb'
  | 'ring'
  | 'cross'
  | 'spiral';

export interface IconSet {
  name: string;
  icons: IconName[];
}

/** Hobby-themed icon sets — each hobby maps to a set of shapes that evoke it. */
const HOBBY_ICON_SETS: Record<string, IconSet> = {
  Basketball: { name: 'Court', icons: ['circle', 'ring', 'cross', 'orb', 'hexagon', 'star'] },
  Football: { name: 'Pitch', icons: ['circle', 'hexagon', 'orb', 'ring', 'triangle', 'star'] },
  Gaming: { name: 'Arcade', icons: ['square', 'cross', 'bolt', 'orb', 'triangle', 'diamond'] },
  Drawing: { name: 'Canvas', icons: ['diamond', 'star', 'spiral', 'circle', 'triangle', 'heart'] },
  Music: { name: 'Stage', icons: ['circle', 'orb', 'ring', 'spiral', 'star', 'bolt'] },
  Reading: { name: 'Library', icons: ['square', 'triangle', 'diamond', 'star', 'circle', 'hexagon'] },
  Cooking: { name: 'Kitchen', icons: ['circle', 'orb', 'hexagon', 'star', 'ring', 'diamond'] },
  Photography: { name: 'Studio', icons: ['ring', 'circle', 'orb', 'hexagon', 'diamond', 'star'] },
  Coding: { name: 'Terminal', icons: ['square', 'bolt', 'cross', 'triangle', 'diamond', 'orb'] },
  Dancing: { name: 'Floor', icons: ['spiral', 'star', 'circle', 'orb', 'heart', 'bolt'] },
  Chess: { name: 'Board', icons: ['square', 'diamond', 'cross', 'triangle', 'hexagon', 'star'] },
  Writing: { name: 'Desk', icons: ['triangle', 'diamond', 'star', 'square', 'spiral', 'circle'] },
};

const FALLBACK_SET: IconSet = { name: 'Neon', icons: ['circle', 'triangle', 'square', 'diamond', 'star', 'hexagon'] };

export function getHobbyIconSet(hobbies: string[]): IconSet {
  for (const h of hobbies) {
    if (HOBBY_ICON_SETS[h]) return HOBBY_ICON_SETS[h];
  }
  return FALLBACK_SET;
}

/** Get a set of at least `count` icons, cycling if needed. */
export function getIconSet(hobbies: string[], count = 6): IconName[] {
  const set = getHobbyIconSet(hobbies);
  const icons = set.icons;
  const result: IconName[] = [];
  for (let i = 0; i < count; i++) result.push(icons[i % icons.length]);
  return result;
}

/** Hobby-themed emoji sets — fun, colorful emojis instead of plain shapes. */
const HOBBY_EMOJI_SETS: Record<string, string[]> = {
  Basketball: ['🏀', '🥇', '⚡', '🔥', '💪', '🏆'],
  Football: ['⚽', '🥅', '⚡', '🔥', '💪', '🏆'],
  Gaming: ['🎮', '🕹️', '⚡', '💥', '🎯', '🏆'],
  Drawing: ['🎨', '✏️', '🌈', '💫', '⭐', '🖌️'],
  Music: ['🎵', '🎸', '🥁', '🎤', '🎶', '✨'],
  Reading: ['📚', '📖', '🧠', '💡', '⭐', '✨'],
  Cooking: ['🍳', '🔥', '⭐', '🥘', '✨', '👨‍🍳'],
  Photography: ['📷', '🌅', '✨', '🌈', '⭐', '💫'],
  Coding: ['💻', '⚡', '🧩', '🔧', '💡', '🚀'],
  Dancing: ['💃', '🕺', '🎵', '✨', '🔥', '⭐'],
  Chess: ['♟️', '👑', '🏰', '⚡', '🧠', '🏆'],
  Writing: ['✍️', '📝', '💡', '📖', '⭐', '✨'],
};

const FALLBACK_EMOJIS = ['⭐', '✨', '💫', '🔥', '🎯', '🚀'];

/** Get emoji set for hobbies — cooler than plain shapes. */
export function getEmojiSet(hobbies: string[], count = 6): string[] {
  for (const h of hobbies) {
    if (HOBBY_EMOJI_SETS[h]) {
      const set = HOBBY_EMOJI_SETS[h];
      const result: string[] = [];
      for (let i = 0; i < count; i++) result.push(set[i % set.length]);
      return result;
    }
  }
  return FALLBACK_EMOJIS.slice(0, count);
}

/** Get a single emoji for a hobby (for intro screens). */
export function getHobbyEmoji(hobbies: string[]): string {
  for (const h of hobbies) {
    if (HOBBY_EMOJI_SETS[h]) return HOBBY_EMOJI_SETS[h][0];
  }
  return '🎯';
}

/** Hobby-themed background style name for game backgrounds. */
export function getHobbyBackground(hobbies: string[]): string {
  const set = getHobbyIconSet(hobbies);
  return set.name;
}

const GRADIENT_IDS: Record<IconName, [string, string]> = {
  circle: ['#a855f7', '#8b5cf6'],
  triangle: ['#22d3ee', '#06b6d4'],
  square: ['#ec4899', '#f472b6'],
  diamond: ['#a3e635', '#84cc16'],
  hexagon: ['#f59e0b', '#f97316'],
  star: ['#ec4899', '#a855f7'],
  bolt: ['#22d3ee', '#a855f7'],
  heart: ['#ec4899', '#f43f5e'],
  orb: ['#8b5cf6', '#22d3ee'],
  ring: ['#a855f7', '#ec4899'],
  cross: ['#22d3ee', '#84cc16'],
  spiral: ['#f59e0b', '#ec4899'],
};

let gradientCounter = 0;

export function NeonIcon({
  name,
  size = 48,
  className = '',
  glow = true,
}: {
  name: IconName;
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  const [c1, c2] = GRADIENT_IDS[name];
  const gid = `g-${name}-${gradientCounter++}`;
  const fid = `f-${name}-${gradientCounter++}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      style={glow ? { filter: `drop-shadow(0 0 6px ${c1}88)` } : undefined}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        {glow && (
          <filter id={fid} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      <g filter={glow ? `url(#${fid})` : undefined} fill={`url(#${gid})`}>
        {renderShape(name)}
      </g>
    </svg>
  );
}

function renderShape(name: IconName): ReactNode {
  switch (name) {
    case 'circle':
      return <circle cx="24" cy="24" r="16" />;
    case 'triangle':
      return <polygon points="24,6 42,40 6,40" />;
    case 'square':
      return <rect x="8" y="8" width="32" height="32" rx="4" />;
    case 'diamond':
      return <polygon points="24,4 44,24 24,44 4,24" />;
    case 'hexagon':
      return <polygon points="24,4 41,14 41,34 24,44 7,34 7,14" />;
    case 'star':
      return (
        <polygon points="24,3 29,18 45,18 32,28 37,44 24,34 11,44 16,28 3,18 19,18" />
      );
    case 'bolt':
      return <polygon points="26,4 10,26 22,26 18,44 38,20 26,20" />;
    case 'heart':
      return <path d="M24 42S6 30 6 18a8 8 0 0 1 18-4 8 8 0 0 1 18 4c0 12-18 24-18 24z" />;
    case 'orb':
      return <circle cx="24" cy="24" r="14" fillOpacity="0.7" />;
    case 'ring':
      return (
        <>
          <circle cx="24" cy="24" r="16" fillOpacity="0.2" />
          <circle cx="24" cy="24" r="11" fillOpacity="0.6" />
          <circle cx="24" cy="24" r="6" />
        </>
      );
    case 'cross':
      return (
        <>
          <rect x="20" y="6" width="8" height="36" rx="2" />
          <rect x="6" y="20" width="36" height="8" rx="2" />
        </>
      );
    case 'spiral':
      return (
        <path
          d="M24 24 m-2 0 a2 2 0 1 1 4 0 a4 4 0 1 1 -8 0 a6 6 0 1 1 12 0 a8 8 0 1 1 -16 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    default:
      return <circle cx="24" cy="24" r="16" />;
  }
}

/** Subject-aware content engine — generates game content based on favorite subject. */
export type Subject = string;

export function isMathSubject(subject: string | null | undefined): boolean {
  if (!subject) return false;
  const s = subject.toLowerCase();
  return s === 'math' || s === 'maths' || s === 'mathematics' || s === 'statistics';
}

export function isLanguageSubject(subject: string | null | undefined): boolean {
  if (!subject) return false;
  const s = subject.toLowerCase();
  return (
    s === 'english' ||
    s === 'literature' ||
    s === 'foreign languages' ||
    s.includes('language') ||
    s === 'writing'
  );
}

export function isArtSubject(subject: string | null | undefined): boolean {
  if (!subject) return false;
  const s = subject.toLowerCase();
  return s === 'art' || s === 'design & technology' || s === 'architecture' || s === 'music';
}

export function isScienceSubject(subject: string | null | undefined): boolean {
  if (!subject) return false;
  const s = subject.toLowerCase();
  return (
    s === 'biology' ||
    s === 'chemistry' ||
    s === 'physics' ||
    s === 'environmental science' ||
    s === 'medicine' ||
    s === 'nursing'
  );
}

/** Generate processing-speed prompts based on subject. */
export interface SpeedPrompt {
  display: string;
  answer: string;
}

export function generateSpeedPrompts(subject: string | null | undefined, count = 20): SpeedPrompt[] {
  if (isMathSubject(subject)) {
    return generateMathPrompts(count);
  }
  if (isLanguageSubject(subject)) {
    return generateLanguagePrompts(count);
  }
  if (isArtSubject(subject)) {
    return generateArtPrompts(count);
  }
  if (isScienceSubject(subject)) {
    return generateSciencePrompts(count);
  }
  // Default: matching task (shape/color matching, no math)
  return generateMatchingPrompts(count);
}

function generateMathPrompts(count: number): SpeedPrompt[] {
  const prompts: SpeedPrompt[] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const op = ['+', '-', '×'][Math.floor(Math.random() * 3)];
    let ans = 0;
    if (op === '+') ans = a + b;
    else if (op === '-') ans = a - b;
    else ans = a * b;
    prompts.push({ display: `${a} ${op} ${b} = ?`, answer: String(ans) });
  }
  return prompts;
}

function generateLanguagePrompts(count: number): SpeedPrompt[] {
  const pairs: [string, string][] = [
    ['Synonym of "Happy"', 'Joyful'],
    ['Synonym of "Sad"', 'Sorrowful'],
    ['Synonym of "Big"', 'Large'],
    ['Synonym of "Fast"', 'Quick'],
    ['Synonym of "Smart"', 'Clever'],
    ['Antonym of "Hot"', 'Cold'],
    ['Antonym of "Up"', 'Down'],
    ['Antonym of "Day"', 'Night'],
    ['Antonym of "Old"', 'Young'],
    ['Antonym of "Strong"', 'Weak'],
    ['Past tense of "Run"', 'Ran'],
    ['Past tense of "Eat"', 'Ate'],
    ['Past tense of "Go"', 'Went'],
    ['Past tense of "Sing"', 'Sang'],
    ['Past tense of "Write"', 'Wrote'],
    ['Plural of "Child"', 'Children'],
    ['Plural of "Foot"', 'Feet'],
    ['Plural of "Mouse"', 'Mice'],
    ['Plural of "Tooth"', 'Teeth'],
    ['Plural of "Leaf"', 'Leaves'],
  ];
  const shuffled = shuffle(pairs);
  return shuffled.slice(0, count).map(([display, answer]) => ({ display, answer }));
}

function generateArtPrompts(count: number): SpeedPrompt[] {
  const pairs: [string, string][] = [
    ['Complement of Blue', 'Orange'],
    ['Complement of Red', 'Green'],
    ['Complement of Yellow', 'Purple'],
    ['Complement of Green', 'Red'],
    ['Complement of Orange', 'Blue'],
    ['Mix Red + Blue', 'Purple'],
    ['Mix Red + Yellow', 'Orange'],
    ['Mix Blue + Yellow', 'Green'],
    ['Mix Red + White', 'Pink'],
    ['Mix Black + White', 'Gray'],
    ['Primary colors', 'RGB'],
    ['Warm color: Red or Blue?', 'Red'],
    ['Cool color: Green or Orange?', 'Green'],
    ['Neutral color: Brown or Pink?', 'Brown'],
    ['Tint = Color + White?', 'Yes'],
    ['Shade = Color + Black?', 'Yes'],
    ['Triangle = 3 sides?', 'Yes'],
    ['Square = 5 sides?', 'No'],
    ['Circle has corners?', 'No'],
    ['Hexagon = 6 sides?', 'Yes'],
  ];
  const shuffled = shuffle(pairs);
  return shuffled.slice(0, count).map(([display, answer]) => ({ display, answer }));
}

function generateSciencePrompts(count: number): SpeedPrompt[] {
  const pairs: [string, string][] = [
    ['H2O is?', 'Water'],
    ['Symbol for Gold?', 'Au'],
    ['Symbol for Oxygen?', 'O'],
    ['Photosynthesis makes?', 'Glucose'],
    ['Largest organ?', 'Skin'],
    ['Bones in human body?', '206'],
    ['Planet closest to sun?', 'Mercury'],
    ['Gas we breathe in?', 'Oxygen'],
    ['Powerhouse of cell?', 'Mitochondria'],
    ['DNA stands for?', 'Deoxyribonucleic'],
    ['Speed of light symbol?', 'c'],
    ['Plants release?', 'Oxygen'],
    ['Hardest natural substance?', 'Diamond'],
    ['Center of an atom?', 'Nucleus'],
    ['Human blood pH?', '7.4'],
    ['Boiling point of water?', '100'],
    ['Salt formula?', 'NaCl'],
    ['Earth has ___ moons', '1'],
    ['Sun is a?', 'Star'],
    ['Nitrogen symbol?', 'N'],
  ];
  const shuffled = shuffle(pairs);
  return shuffled.slice(0, count).map(([display, answer]) => ({ display, answer }));
}

function generateMatchingPrompts(count: number): SpeedPrompt[] {
  // Shape/color matching — no math, no specific subject
  const pairs: [string, string][] = [
    ['Match: Circle', 'Round'],
    ['Match: Square', 'Box'],
    ['Match: Triangle', 'Pointy'],
    ['Match: Star', 'Sparkle'],
    ['Match: Diamond', 'Gem'],
    ['Color: Sky', 'Blue'],
    ['Color: Grass', 'Green'],
    ['Color: Sun', 'Yellow'],
    ['Color: Apple', 'Red'],
    ['Color: Night', 'Black'],
    ['Color: Cloud', 'White'],
    ['Color: Orange (fruit)', 'Orange'],
    ['Season: Snow', 'Winter'],
    ['Season: Flowers', 'Spring'],
    ['Season: Beach', 'Summer'],
    ['Season: Leaves fall', 'Autumn'],
    ['Direction: Sunrise', 'East'],
    ['Direction: Sunset', 'West'],
    ['Direction: North star', 'North'],
    ['Direction: Compass S', 'South'],
  ];
  const shuffled = shuffle(pairs);
  return shuffled.slice(0, count).map(([display, answer]) => ({ display, answer }));
}

/** Pattern sequence generator — subject-aware. */
export interface PatternPuzzle {
  sequence: (string | number)[];
  options: (string | number)[];
  answer: number;
}

export function generatePatternPuzzles(subject: string | null | undefined): PatternPuzzle[] {
  if (isMathSubject(subject)) return MATH_PATTERNS;
  if (isLanguageSubject(subject)) return LANGUAGE_PATTERNS;
  if (isArtSubject(subject)) return ART_PATTERNS;
  if (isScienceSubject(subject)) return SCIENCE_PATTERNS;
  return SHAPE_PATTERNS;
}

const MATH_PATTERNS: PatternPuzzle[] = [
  { sequence: [2, 4, 6, 8], options: [10, 9, 12, 11], answer: 0 },
  { sequence: [1, 4, 9, 16], options: [20, 24, 25, 36], answer: 2 },
  { sequence: [3, 6, 12, 24], options: [36, 48, 30, 42], answer: 1 },
  { sequence: [100, 50, 25], options: [12, 10, 12.5, 5], answer: 2 },
  { sequence: [1, 1, 2, 3, 5], options: [8, 7, 6, 5], answer: 0 },
  { sequence: [2, 3, 5, 9, 17], options: [33, 34, 35, 31], answer: 0 },
  { sequence: [5, 10, 15, 20], options: [22, 25, 30, 24], answer: 1 },
  { sequence: [1, 8, 27, 64], options: [100, 125, 121, 144], answer: 1 },
];

const SHAPE_PATTERNS: PatternPuzzle[] = [
  { sequence: ['▲', '●', '▲', '●', '▲'], options: ['●', '▲', '■', '◆'], answer: 1 },
  { sequence: ['●', '■', '◆', '★', '⬟'], options: ['▲', '●', '■', '◆'], answer: 0 },
  { sequence: ['★', '◆', '★', '◆'], options: ['★', '■', '●', '▲'], answer: 0 },
  { sequence: ['▲', '▲', '●', '●', '■', '■'], options: ['◆', '★', '▲', '●'], answer: 3 },
  { sequence: ['●', '●', '▲', '●', '●', '▲'], options: ['●', '▲', '■', '◆'], answer: 0 },
  { sequence: ['◆', '★', '⬟', '◆', '★'], options: ['⬟', '◆', '★', '▲'], answer: 0 },
  { sequence: ['▲', '●', '■', '◆', '★'], options: ['⬟', '▲', '●', '■'], answer: 0 },
  { sequence: ['★', '★', '◆', '★', '★', '◆'], options: ['★', '◆', '■', '●'], answer: 1 },
];

const LANGUAGE_PATTERNS: PatternPuzzle[] = [
  { sequence: ['A', 'B', 'C', 'D'], options: ['E', 'F', 'Z', 'G'], answer: 0 },
  { sequence: ['Cat', 'Dog', 'Cat', 'Dog', 'Cat'], options: ['Dog', 'Cat', 'Bird', 'Fish'], answer: 1 },
  { sequence: ['Run', 'Walk', 'Run', 'Walk'], options: ['Run', 'Jump', 'Walk', 'Sit'], answer: 2 },
  { sequence: ['Red', 'Blue', 'Red', 'Blue', 'Red'], options: ['Green', 'Blue', 'Red', 'Yellow'], answer: 2 },
  { sequence: ['Big', 'Bigger', 'Biggest'], options: ['Biggerest', 'Biggestest', 'Biggestest', 'Biggester'], answer: 3 },
  { sequence: ['Go', 'Went', 'Go', 'Went'], options: ['Go', 'Gone', 'Went', 'Going'], answer: 2 },
  { sequence: ['One', 'Two', 'Three', 'Four'], options: ['Six', 'Five', 'Seven', 'Eight'], answer: 1 },
  { sequence: ['Sun', 'Moon', 'Sun', 'Moon'], options: ['Star', 'Sun', 'Moon', 'Cloud'], answer: 2 },
];

const ART_PATTERNS: PatternPuzzle[] = [
  { sequence: ['Red', 'Orange', 'Yellow', 'Green'], options: ['Blue', 'Purple', 'Pink', 'Brown'], answer: 0 },
  { sequence: ['Circle', 'Square', 'Circle', 'Square'], options: ['Triangle', 'Circle', 'Square', 'Star'], answer: 2 },
  { sequence: ['Light', 'Medium', 'Dark'], options: ['Darker', 'Darkest', 'Lightest', 'Mediumest'], answer: 1 },
  { sequence: ['Warm', 'Cool', 'Warm', 'Cool'], options: ['Hot', 'Cold', 'Warm', 'Neutral'], answer: 2 },
  { sequence: ['Red', 'Red', 'Blue', 'Red', 'Red'], options: ['Green', 'Yellow', 'Blue', 'Red'], answer: 2 },
  { sequence: ['Thin', 'Medium', 'Thick'], options: ['Thicker', 'Thickest', 'Thinest', 'Mediumest'], answer: 1 },
  { sequence: ['Pastel', 'Bright', 'Pastel', 'Bright'], options: ['Dark', 'Pastel', 'Bright', 'Muted'], answer: 2 },
  { sequence: ['Line', 'Curve', 'Line', 'Curve'], options: ['Dot', 'Line', 'Curve', 'Shape'], answer: 2 },
];

const SCIENCE_PATTERNS: PatternPuzzle[] = [
  { sequence: ['Solid', 'Liquid', 'Gas'], options: ['Plasma', 'Fluid', 'Vapor', 'Ice'], answer: 0 },
  { sequence: ['Seed', 'Sprout', 'Sapling', 'Tree'], options: ['Forest', 'Flower', 'Fruit', 'Root'], answer: 1 },
  { sequence: ['Atom', 'Molecule', 'Cell'], options: ['Organ', 'Tissue', 'Nucleus', 'Electron'], answer: 1 },
  { sequence: ['Spring', 'Summer', 'Autumn', 'Winter'], options: ['Spring', 'Fall', 'Monsoon', 'Dry'], answer: 0 },
  { sequence: ['H', 'He', 'Li', 'Be'], options: ['B', 'C', 'N', 'O'], answer: 0 },
  { sequence: ['Larva', 'Pupa', 'Butterfly'], options: ['Egg', 'Moth', 'Cocoon', 'Worm'], answer: 0 },
  { sequence: ['New', 'Waxing', 'Full', 'Waning'], options: ['Dark', 'New', 'Gibbous', 'Crescent'], answer: 1 },
  { sequence: ['Cell', 'Tissue', 'Organ', 'System'], options: ['Body', 'Organism', 'Atom', 'Muscle'], answer: 1 },
];

/** Active recall cards — subject-aware. */
export interface RecallCard {
  fact: string;
  options: string[];
  answer: number;
}

export function generateRecallCards(subject: string | null | undefined): RecallCard[] {
  if (isLanguageSubject(subject)) return LANGUAGE_CARDS;
  if (isArtSubject(subject)) return ART_CARDS;
  if (isScienceSubject(subject)) return SCIENCE_CARDS;
  if (isMathSubject(subject)) return MATH_CARDS;
  return GENERAL_CARDS;
}

const GENERAL_CARDS: RecallCard[] = [
  { fact: 'The Great Wall of China is over 13,000 miles long.', options: ['True', 'False'], answer: 0 },
  { fact: 'Water boils at 100°C at sea level.', options: ['True', 'False'], answer: 0 },
  { fact: 'A square has 5 sides.', options: ['True', 'False'], answer: 1 },
  { fact: 'The sun rises in the east.', options: ['True', 'False'], answer: 0 },
  { fact: 'Octopuses have three hearts.', options: ['True', 'False'], answer: 0 },
  { fact: 'The Pacific Ocean is the largest ocean on Earth.', options: ['True', 'False'], answer: 0 },
  { fact: 'Humans have 4 lungs.', options: ['True', 'False'], answer: 1 },
  { fact: 'Light travels faster than sound.', options: ['True', 'False'], answer: 0 },
];

const MATH_CARDS: RecallCard[] = [
  { fact: 'A triangle has 3 sides.', options: ['True', 'False'], answer: 0 },
  { fact: '7 × 8 = 56.', options: ['True', 'False'], answer: 0 },
  { fact: 'The square root of 144 is 13.', options: ['True', 'False'], answer: 1 },
  { fact: 'A prime number has exactly 2 factors.', options: ['True', 'False'], answer: 0 },
  { fact: '0 is a positive number.', options: ['True', 'False'], answer: 1 },
  { fact: 'The sum of angles in a triangle is 180°.', options: ['True', 'False'], answer: 0 },
  { fact: '12 is a prime number.', options: ['True', 'False'], answer: 1 },
  { fact: 'An even number is divisible by 2.', options: ['True', 'False'], answer: 0 },
];

const LANGUAGE_CARDS: RecallCard[] = [
  { fact: 'A synonym is a word with the same meaning.', options: ['True', 'False'], answer: 0 },
  { fact: '"Run" is the past tense of "Ran".', options: ['True', 'False'], answer: 1 },
  { fact: 'A noun is a person, place, or thing.', options: ['True', 'False'], answer: 0 },
  { fact: 'The plural of "Child" is "Childs".', options: ['True', 'False'], answer: 1 },
  { fact: 'An adjective describes a noun.', options: ['True', 'False'], answer: 0 },
  { fact: 'A verb shows action.', options: ['True', 'False'], answer: 0 },
  { fact: '"Beautifully" is an adverb.', options: ['True', 'False'], answer: 0 },
  { fact: 'A sentence must have at least a subject and verb.', options: ['True', 'False'], answer: 0 },
];

const ART_CARDS: RecallCard[] = [
  { fact: 'The three primary colors are Red, Blue, and Yellow.', options: ['True', 'False'], answer: 0 },
  { fact: 'Purple is a primary color.', options: ['True', 'False'], answer: 1 },
  { fact: 'A tint is made by adding white to a color.', options: ['True', 'False'], answer: 0 },
  { fact: 'A shade is made by adding black to a color.', options: ['True', 'False'], answer: 0 },
  { fact: 'Warm colors include red, orange, and yellow.', options: ['True', 'False'], answer: 0 },
  { fact: 'Blue is a warm color.', options: ['True', 'False'], answer: 1 },
  { fact: 'A hexagon has 6 sides.', options: ['True', 'False'], answer: 0 },
  { fact: 'Complementary colors are opposite on the color wheel.', options: ['True', 'False'], answer: 0 },
];

const SCIENCE_CARDS: RecallCard[] = [
  { fact: 'H2O is the chemical formula for water.', options: ['True', 'False'], answer: 0 },
  { fact: 'The human body has 206 bones.', options: ['True', 'False'], answer: 0 },
  { fact: 'Plants absorb carbon dioxide and release oxygen.', options: ['True', 'False'], answer: 0 },
  { fact: 'The sun is a planet.', options: ['True', 'False'], answer: 1 },
  { fact: 'Mitochondria are the powerhouse of the cell.', options: ['True', 'False'], answer: 0 },
  { fact: 'Sound travels faster than light.', options: ['True', 'False'], answer: 1 },
  { fact: 'Gold has the chemical symbol Au.', options: ['True', 'False'], answer: 0 },
  { fact: 'The heart pumps blood through the body.', options: ['True', 'False'], answer: 0 },
];

/** Logical reasoning riddles — subject-aware. */
export interface Riddle {
  question: string;
  options: string[];
  answer: number;
}

export function generateRiddles(subject: string | null | undefined): Riddle[] {
  if (isLanguageSubject(subject)) return LANGUAGE_RIDDLES;
  if (isArtSubject(subject)) return ART_RIDDLES;
  if (isScienceSubject(subject)) return SCIENCE_RIDDLES;
  if (isMathSubject(subject)) return MATH_RIDDLES;
  return GENERAL_RIDDLES;
}

const GENERAL_RIDDLES: Riddle[] = [
  { question: "I'm tall when I'm young and short when I'm old. What am I?", options: ['A tree', 'A candle', 'A person', 'A pencil'], answer: 1 },
  { question: 'What has hands but cannot clap?', options: ['A clock', 'A statue', 'A doll', 'A glove'], answer: 0 },
  { question: 'What can travel around the world while staying in one corner?', options: ['Wind', 'A stamp', 'Light', 'A thought'], answer: 1 },
  { question: 'A is taller than B. B is taller than C. Who is shortest?', options: ['A', 'B', 'C', "Can't tell"], answer: 2 },
  { question: 'What has keys but no locks?', options: ['A door', 'A piano', 'A map', 'A keyboard'], answer: 1 },
  { question: 'Which shape is the odd one out: circle, oval, sphere, square?', options: ['Circle', 'Oval', 'Sphere', 'Square'], answer: 3 },
  { question: 'What gets wetter as it dries?', options: ['A towel', 'A sponge', 'Rain', 'Ice'], answer: 0 },
  { question: 'If you have 3 apples and take away 2, how many do you have?', options: ['1', '2', '3', '5'], answer: 1 },
];

const MATH_RIDDLES: Riddle[] = [
  { question: 'If all wimps are plops and some plops are blips, which must be true?', options: ['All wimps are blips', 'Some wimps might be blips', 'No wimps are blips', 'All blips are wimps'], answer: 1 },
  { question: 'Which number comes next: 2, 3, 5, 9, 17, ___?', options: ['33', '34', '35', '31'], answer: 0 },
  { question: 'A is taller than B. B is taller than C. Who is shortest?', options: ['A', 'B', 'C', "Can't tell"], answer: 2 },
  { question: 'If 3 cats catch 3 mice in 3 minutes, how long for 100 cats to catch 100 mice?', options: ['3 min', '100 min', '33 min', '300 min'], answer: 0 },
  { question: 'What is half of two plus two?', options: ['2', '3', '4', '1'], answer: 1 },
  { question: 'Which is larger: 1/3 or 3/8?', options: ['1/3', '3/8', 'Equal', "Can't tell"], answer: 1 },
  { question: 'A clock shows 3:15. What is the angle between the hands?', options: ['0°', '7.5°', '15°', '22.5°'], answer: 1 },
  { question: 'How many squares are on a chessboard?', options: ['64', '128', '204', '256'], answer: 2 },
];

const LANGUAGE_RIDDLES: Riddle[] = [
  { question: 'Which word is the odd one out: Run, Walk, Jump, Sit?', options: ['Run', 'Walk', 'Jump', 'Sit'], answer: 3 },
  { question: 'What is the antonym of "ancient"?', options: ['Old', 'Modern', 'Historic', 'Classic'], answer: 1 },
  { question: 'Which is a synonym of "happy": sad, joyful, angry, tired?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], answer: 1 },
  { question: 'What is the plural of "mouse"?', options: ['Mouses', 'Mice', 'Mouse', 'Mices'], answer: 1 },
  { question: 'Which word does NOT rhyme: cat, bat, hat, dog?', options: ['Cat', 'Bat', 'Hat', 'Dog'], answer: 3 },
  { question: 'What is a noun?', options: ['An action', 'A describing word', 'A person, place, or thing', 'A joining word'], answer: 2 },
  { question: 'Which is the past tense of "go"?', options: ['Goed', 'Gone', 'Went', 'Going'], answer: 2 },
  { question: 'An anagram of "listen" is:', options: ['Silent', 'Tinsel', 'Enlist', 'All of the above'], answer: 3 },
];

const ART_RIDDLES: Riddle[] = [
  { question: 'Which is NOT a primary color?', options: ['Red', 'Blue', 'Green', 'Yellow'], answer: 2 },
  { question: 'What do you get when you mix red and blue?', options: ['Green', 'Orange', 'Purple', 'Brown'], answer: 2 },
  { question: 'Which shape has 6 sides?', options: ['Triangle', 'Square', 'Pentagon', 'Hexagon'], answer: 3 },
  { question: 'What is the complement of blue?', options: ['Red', 'Orange', 'Green', 'Yellow'], answer: 1 },
  { question: 'Which is a warm color?', options: ['Blue', 'Green', 'Purple', 'Orange'], answer: 3 },
  { question: 'A tint is made by adding what to a color?', options: ['Black', 'White', 'Gray', 'Water'], answer: 1 },
  { question: 'Which is NOT a shape?', options: ['Circle', 'Triangle', 'Crimson', 'Diamond'], answer: 2 },
  { question: 'What has no corners?', options: ['Square', 'Triangle', 'Circle', 'Star'], answer: 2 },
];

const SCIENCE_RIDDLES: Riddle[] = [
  { question: 'What gas do plants absorb?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], answer: 1 },
  { question: 'Which is the largest planet in our solar system?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], answer: 2 },
  { question: 'What is the chemical symbol for water?', options: ['CO2', 'H2O', 'O2', 'NaCl'], answer: 1 },
  { question: 'Which organ pumps blood?', options: ['Lungs', 'Liver', 'Heart', 'Brain'], answer: 2 },
  { question: 'What is the hardest natural substance?', options: ['Gold', 'Iron', 'Diamond', 'Quartz'], answer: 2 },
  { question: 'Which is NOT a state of matter?', options: ['Solid', 'Liquid', 'Gas', 'Color'], answer: 3 },
  { question: 'What do bees produce?', options: ['Milk', 'Honey', 'Silk', 'Wax only'], answer: 1 },
  { question: 'Which is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Membrane'], answer: 2 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shuffleArray<T>(arr: T[]): T[] {
  return shuffle(arr);
}
