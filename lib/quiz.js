export const QUIZ_KINDS = ["recognition", "production", "composition", "legacy"]
export const QUIZ_RESPONSE_MODES = ["mcq", "typing", "drawing", "ordering", "matching"]
export const QUIZ_SOURCE_MODES = ["audio", "kana", "romaji", "svg", "word", "text"]
export const QUIZ_TARGET_MODES = ["kana", "romaji", "word", "text"]
export const QUIZ_SCOPES = ["kana", "combo", "word", "custom"]
export const QUIZ_PRESETS = [
  {
    id: "kana-to-romaji-mcq",
    label: "Kana to Romaji",
    kind: "recognition",
    template: "single-answer",
    scope: "kana",
    source: { modality: "kana" },
    responseMode: "mcq",
    answer: { modality: "romaji" },
  },
  {
    id: "audio-to-romaji-mcq",
    label: "Audio to Romaji",
    kind: "recognition",
    template: "single-answer",
    scope: "kana",
    source: { modality: "audio" },
    responseMode: "mcq",
    answer: { modality: "romaji" },
  },
  {
    id: "audio-to-kana-mcq",
    label: "Audio to Kana",
    kind: "recognition",
    template: "single-answer",
    scope: "kana",
    source: { modality: "audio" },
    responseMode: "mcq",
    answer: { modality: "kana" },
  },
  {
    id: "romaji-to-kana-typing",
    label: "Romaji to Kana",
    kind: "production",
    template: "single-answer",
    scope: "kana",
    source: { modality: "romaji" },
    responseMode: "typing",
    answer: { modality: "kana" },
  },
  {
    id: "romaji-to-kana-drawing",
    label: "Romaji to Kana Drawing",
    kind: "production",
    template: "single-answer",
    scope: "kana",
    source: { modality: "romaji" },
    responseMode: "drawing",
    answer: { modality: "kana" },
  },
  {
    id: "word-composition",
    label: "Word Composition",
    kind: "composition",
    template: "parts-to-output",
    scope: "word",
    source: { modality: "word" },
    responseMode: "ordering",
    answer: { modality: "word" },
  },
]

export function getQuizPresetById(presetId) {
  return QUIZ_PRESETS.find((preset) => preset.id === presetId) || null
}

export function applyQuizPreset(baseConfig, presetId) {
  const preset = getQuizPresetById(presetId)
  if (!preset) return createDefaultQuizConfig(baseConfig)

  return createDefaultQuizConfig({
    ...baseConfig,
    kind: preset.kind,
    template: preset.template,
    scope: preset.scope,
    responseMode: preset.responseMode,
    source: {
      ...baseConfig.source,
      ...preset.source,
    },
    answer: {
      ...baseConfig.answer,
      ...preset.answer,
    },
  })
}

export function createDefaultQuizConfig(overrides = {}) {
  const base = {
    version: 1,
    kind: "recognition",
    template: "single-answer",
    scope: "kana",
    source: {
      modality: "kana",
      refIds: [],
      value: "",
    },
    responseMode: "mcq",
    answer: {
      modality: "romaji",
      refIds: [],
      value: "",
      acceptedValues: [],
    },
    distractors: {
      strategy: "same-group",
      count: 3,
    },
    composition: {
      parts: [],
      output: "",
    },
    metadata: {
      title: "",
      hint: "",
      tags: [],
    },
    legacy: {
      question: "",
      options: [],
      correctOption: 0,
    },
  }

  return {
    ...base,
    ...overrides,
    source: {
      ...base.source,
      ...(overrides.source || {}),
    },
    answer: {
      ...base.answer,
      ...(overrides.answer || {}),
    },
    distractors: {
      ...base.distractors,
      ...(overrides.distractors || {}),
    },
    composition: {
      ...base.composition,
      ...(overrides.composition || {}),
    },
    metadata: {
      ...base.metadata,
      ...(overrides.metadata || {}),
    },
    legacy: {
      ...base.legacy,
      ...(overrides.legacy || {}),
    },
  }
}

export function mergeQuizConfig(currentConfig, updates = {}) {
  return createDefaultQuizConfig({
    ...(currentConfig || {}),
    ...updates,
    source: {
      ...((currentConfig || {}).source || {}),
      ...(updates.source || {}),
    },
    answer: {
      ...((currentConfig || {}).answer || {}),
      ...(updates.answer || {}),
    },
    distractors: {
      ...((currentConfig || {}).distractors || {}),
      ...(updates.distractors || {}),
    },
    composition: {
      ...((currentConfig || {}).composition || {}),
      ...(updates.composition || {}),
    },
    metadata: {
      ...((currentConfig || {}).metadata || {}),
      ...(updates.metadata || {}),
    },
    legacy: {
      ...((currentConfig || {}).legacy || {}),
      ...(updates.legacy || {}),
    },
  })
}

export function deriveQuizConfigFromPage(page = {}) {
    return createDefaultQuizConfig(page.quizConfig || {})
}

export function validateQuizConfig(config) {
  const errors = []
  
  if (!config.metadata?.title && !config.source?.value) {
    errors.push("Quiz must have a prompt/title")
  }
  
  if (config.responseMode === "mcq") {
    const options = Array.isArray(config.legacy?.options) ? config.legacy.options : []
    const filledOptions = options.filter((o) => String(o || "").trim())
    if (filledOptions.length < 2) {
      errors.push("MCQ quizzes need at least 2 options")
    }
    if (!Number.isInteger(config.legacy?.correctOption) || config.legacy.correctOption < 0 || config.legacy.correctOption >= filledOptions.length) {
      errors.push("Invalid correct option index")
    }
  } else if (config.responseMode === "typing" || config.responseMode === "drawing") {
    if (!String(config.answer?.value || "").trim()) {
      errors.push("Must set expected answer value")
    }
  } else if (config.responseMode === "ordering") {
    const parts = Array.isArray(config.composition?.parts) ? config.composition.parts : []
    if (parts.length < 2) {
      errors.push("Composition needs at least 2 parts")
    }
    if (!config.composition?.output) {
      errors.push("Composition needs a final output")
    }
  }
  
  return errors
}

export function getQuizCorrectAnswer(config) {
  if (config.responseMode === "mcq") {
    const options = Array.isArray(config.legacy?.options) ? config.legacy.options : []
    const idx = config.legacy?.correctOption ?? 0
    return options[idx] || ""
  }
  return config.answer?.value || ""
}

export function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function generateMCQOptions(correctAnswer, distractors = []) {
  const options = [correctAnswer, ...distractors]
  return shuffleArray(options)
}

export function getShuffledMCQWithAnswerIndex(config) {
  const options = Array.isArray(config.legacy?.options) ? config.legacy.options : []
  const originalCorrectIdx = config.legacy?.correctOption ?? 0
  const shuffled = shuffleArray(options)
  const newCorrectIdx = shuffled.indexOf(options[originalCorrectIdx])
  
  return { options: shuffled, correctIndex: newCorrectIdx }
}

export function isQuizConfigComplete(config) {
  return validateQuizConfig(config).length === 0
}
