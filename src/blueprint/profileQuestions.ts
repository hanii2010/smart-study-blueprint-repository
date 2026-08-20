export const SUBJECTS = [
  'Math',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Literature',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Art',
  'Music',
  'Physical Education',
  'Business Studies',
  'Accounting',
  'Psychology',
  'Sociology',
  'Political Science',
  'Philosophy',
  'Environmental Science',
  'Statistics',
  'Foreign Languages',
  'Religious Studies',
  'Design & Technology',
  'Engineering',
  'Law',
  'Medicine',
  'Nursing',
  'Architecture',
  'Marketing',
  'Finance',
] as const;

export const GRADES = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Undergraduate',
  'Postgraduate',
] as const;

export const HOBBIES = [
  'Basketball',
  'Football',
  'Gaming',
  'Drawing',
  'Music',
  'Reading',
  'Cooking',
  'Photography',
  'Coding',
  'Dancing',
  'Chess',
  'Writing',
] as const;

export const HOBBY_SKILL_MAP: Record<string, string[]> = {
  Basketball: ['Strategy', 'Teamwork', 'Quick Reflexes', 'Stamina'],
  Football: ['Teamwork', 'Stamina', 'Strategy', 'Coordination'],
  Gaming: ['Strategy', 'Quick Reflexes', 'Problem Solving', 'Focus'],
  Drawing: ['Creativity', 'Attention to Detail', 'Patience'],
  Music: ['Rhythm', 'Memorization', 'Creativity', 'Focus'],
  Reading: ['Memorization', 'Focus', 'Imagination', 'Vocabulary'],
  Cooking: ['Patience', 'Time Management', 'Creativity'],
  Photography: ['Observation', 'Creativity', 'Patience'],
  Coding: ['Problem Solving', 'Logic', 'Focus', 'Pattern Recognition'],
  Dancing: ['Rhythm', 'Coordination', 'Memorization', 'Creativity'],
  Chess: ['Strategy', 'Logic', 'Pattern Recognition', 'Patience'],
  Writing: ['Creativity', 'Vocabulary', 'Focus', 'Imagination'],
};

export const STUDY_HOURS = ['Less than 1 hour', '1-2 hours', '2-4 hours', '4+ hours'] as const;

export type QuestionType = 'text' | 'number' | 'single' | 'single-custom' | 'multi' | 'multi-custom';

export interface Question {
  key: string;
  prompt: string;
  type: QuestionType;
  options?: readonly string[];
  min?: number;
  max?: number;
  placeholder?: string;
  /** derive options from a previously-answered field */
  optionsFrom?: 'subjects' | 'hobbies';
  /** allow custom "Other" entry */
  allowCustom?: boolean;
  /** validation: minimum number of selections for multi */
  minSelections?: number;
}

export const QUESTIONS: Question[] = [
  { key: 'name', prompt: "What's your name?", type: 'text', placeholder: 'e.g. Alex' },
  { key: 'age', prompt: 'How old are you?', type: 'number', min: 5, max: 100, placeholder: 'e.g. 15' },
  { key: 'grade', prompt: 'What grade/level are you in?', type: 'single', options: GRADES },
  { key: 'subjects', prompt: 'Which subjects do you take?', type: 'multi-custom', options: SUBJECTS, allowCustom: true, minSelections: 1 },
  {
    key: 'favorite_subject',
    prompt: 'Which is your favorite subject?',
    type: 'single-custom',
    optionsFrom: 'subjects',
    allowCustom: true,
  },
  {
    key: 'strongest_subject',
    prompt: 'Which is your strongest subject?',
    type: 'single-custom',
    optionsFrom: 'subjects',
    allowCustom: true,
  },
  {
    key: 'weakest_subject',
    prompt: 'Which is your weakest subject?',
    type: 'single-custom',
    optionsFrom: 'subjects',
    allowCustom: true,
  },
  {
    key: 'last_year_percentage',
    prompt: 'What percentage did you score last year?',
    type: 'number',
    min: 0,
    max: 100,
    placeholder: '0 - 100',
  },
  {
    key: 'goal_percentage',
    prompt: "What's your percentage goal for this year?",
    type: 'number',
    min: 0,
    max: 100,
    placeholder: '0 - 100',
  },
  {
    key: 'hobbies',
    prompt: 'What are your hobbies?',
    type: 'multi-custom',
    options: HOBBIES,
    allowCustom: true,
    minSelections: 1,
  },
  {
    key: 'hobby_skills',
    prompt: 'Any skills related to those hobbies?',
    type: 'multi-custom',
    optionsFrom: 'hobbies',
    allowCustom: true,
    minSelections: 1,
  },
  { key: 'study_hours', prompt: 'On average, how many hours do you study per day?', type: 'single', options: STUDY_HOURS },
];

export type ProfileAnswers = Record<string, string | string[] | number | null>;
