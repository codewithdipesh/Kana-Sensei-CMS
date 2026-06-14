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
  if (page.quizConfig) {
    return createDefaultQuizConfig(page.quizConfig)
  }

  const options = Array.isArray(page.options) ? page.options : []
  const correctOption = Number.isInteger(page.correctOption) ? page.correctOption : 0
  const correctValue = options[correctOption] || ""

  return createDefaultQuizConfig({
    kind: "legacy",
    template: "legacy-mcq",
    scope: page.kanaId ? "kana" : "text",
    source: {
      modality: page.kanaId ? "kana" : "text",
      refIds: page.kanaId ? [page.kanaId] : [],
      value: page.question || "",
    },
    responseMode: "mcq",
    answer: {
      modality: page.kanaId ? "romaji" : "text",
      refIds: page.kanaId ? [page.kanaId] : [],
      value: correctValue,
      acceptedValues: correctValue ? [correctValue] : [],
    },
    metadata: {
      title: page.title || "",
      hint: page.hintText || "",
      tags: page.kanaId ? ["kana"] : ["legacy"],
    },
    legacy: {
      question: page.question || "",
      options,
      correctOption,
    },
  })
}
