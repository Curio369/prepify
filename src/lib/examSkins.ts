// Exam "skins" — each real exam (JEE Main, NEET, …) has its own interface config.
// Upload-driven: the uploaded DPP renders inside the matching skin so the student
// feels the actual exam-hall screen. Adding a new exam = adding an entry here.

export type SkinId = 'JEE_MAIN' | 'NEET' | 'GENERIC'

export interface ExamSkin {
  id: SkinId
  name: string            // short label, e.g. "JEE Main"
  fullName: string        // shown in the NTA header
  family: 'NTA' | 'GENERIC'
  // Canonical subject order for section tabs. Subjects not listed are appended
  // (in first-seen order) after these.
  subjectOrder: string[]
  marking: {
    correct: number       // marks for a correct answer
    wrong: number         // negative marks for a wrong answer (MCQ)
    numericalWrong: number // negative marks for a wrong numerical answer
  }
  // Minutes per question used to derive a realistic countdown for upload-driven
  // papers (JEE Main = 180min / 75q = 2.4). Total timer is clamped to [10, 180].
  minutesPerQuestion: number
}

export const EXAM_SKINS: Record<SkinId, ExamSkin> = {
  JEE_MAIN: {
    id: 'JEE_MAIN',
    name: 'JEE Main',
    fullName: 'Joint Entrance Examination (Main)',
    family: 'NTA',
    subjectOrder: ['Physics', 'Chemistry', 'Mathematics', 'Maths'],
    marking: { correct: 4, wrong: -1, numericalWrong: -1 },
    minutesPerQuestion: 2.4,
  },
  NEET: {
    id: 'NEET',
    name: 'NEET',
    fullName: 'National Eligibility cum Entrance Test (UG)',
    family: 'NTA',
    subjectOrder: ['Physics', 'Chemistry', 'Botany', 'Zoology', 'Biology'],
    marking: { correct: 4, wrong: -1, numericalWrong: -1 },
    minutesPerQuestion: 1.02, // 200min / 200q
  },
  GENERIC: {
    id: 'GENERIC',
    name: 'Practice',
    fullName: 'Practice Test',
    family: 'GENERIC',
    subjectOrder: [],
    marking: { correct: 4, wrong: -1, numericalWrong: -1 },
    minutesPerQuestion: 2,
  },
}

export function resolveSkin(id: string | null | undefined): ExamSkin {
  if (id && id in EXAM_SKINS) return EXAM_SKINS[id as SkinId]
  return EXAM_SKINS.GENERIC
}

// Map an upload-page exam-type choice → the skin used to render it.
export const EXAM_TYPE_TO_SKIN: Record<string, SkinId> = {
  'JEE Main': 'JEE_MAIN',
  'NEET': 'NEET',
  // CTET / UPTET / Other fall through to the generic dark interface.
}
