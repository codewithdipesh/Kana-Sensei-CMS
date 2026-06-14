/**
 * Plain JS shape documentation for core entities used in Firestore.
 * These are documentation-only; not enforced at runtime.
 */

/**
 * Character
 * @typedef {Object} Character
 * @property {string} id - document id (string)
 * @property {string} character
 * @property {string} romaji
 * @property {string} kana_type
 * @property {string} svgUrl
 * @property {string} audioUrl
 * @property {string} example_word
 * @property {string} notes
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * Lesson
 * @typedef {Object} Lesson
 * @property {string} id
 * @property {string} title
 * @property {number} orderNumber
 * @property {string} chapterId
 * @property {string} shortDescription
 * @property {string} expandedTitle
 * @property {string} detailedDescription
 */

/**
 * Chapter
 * @typedef {Object} Chapter
 * @property {string} id
 * @property {string} name
 * @property {number} orderNumber
 * @property {string} description
 * @property {string} scriptType
 * @property {string[]} lessonIds
 */

/**
 * Page
 * @typedef {Object} Page
 * @property {string} id
 * @property {number} order
 * @property {string} title
 * @property {string} type
 * @property {string} badge
 * @property {any} content
 * @property {string} kanaId
 * @property {boolean} autoPlay
 * @property {string} hintText
 * @property {QuizConfig} quizConfig
 */

/**
 * QuizConfig
 * Normalized quiz recipe used by the editor and future composer flow.
 * @typedef {Object} QuizConfig
 * @property {number} version
 * @property {"recognition"|"production"|"composition"|"legacy"} kind
 * @property {string} template
 * @property {string} scope
 * @property {{ modality: string, refIds: string[], value: string }} source
 * @property {string} responseMode
 * @property {{ modality: string, refIds: string[], value: string, acceptedValues: string[] }} answer
 * @property {{ strategy: string, count: number }} distractors
 * @property {{ parts: any[], output: string }} composition
 * @property {{ title: string, hint: string, tags: string[] }} metadata
 */

export {} // module marker
