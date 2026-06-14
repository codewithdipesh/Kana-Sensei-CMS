# Quiz System Guide

This app treats a quiz as a normal lesson page with extra structured data attached.

## Where It Lives

Quiz pages are stored in Firestore under:

```txt
lessons/{lessonId}/pages/{pageId}
```

## Two Layers Of Quiz Data

Each quiz page can contain both:

- legacy quiz fields
- the new structured `quizConfig`

### Legacy Fields

These are the older, simple MCQ fields:

- `question` = the prompt shown to the user
- `options` = the answer choices
- `correctOption` = the index of the correct choice

This old shape still works and is kept for backward compatibility.

### New `quizConfig`

This is the real quiz recipe.

It tells the app:

- what the user sees or hears first
- how the user answers
- what the correct answer is
- whether the quiz is about kana, combos, or words
- how the quiz should behave at runtime

## Main Quiz Fields

### `source`
What starts the question.

Examples:

- `audio`
- `kana`
- `romaji`
- `svg`
- `word`

### `responseMode`
How the learner answers.

Examples:

- `mcq` = choose one option
- `typing` = type the answer
- `drawing` = draw the kana
- `ordering` = arrange parts
- `matching` = connect pairs

### `answer`
What the correct target is.

Examples:

- `kana`
- `romaji`
- `word`

### `scope`
How big the quiz is.

Examples:

- `kana` = one kana
- `combo` = multiple kana together
- `word` = a whole word
- `custom` = special cases

### `kind`
What learning style the quiz uses.

Examples:

- `recognition`
- `production`
- `composition`
- `legacy`

## Mental Model

Think of the quiz like this:

- `source` = what the user sees or hears
- `responseMode` = how the user responds
- `answer` = the correct result
- `scope` = kana, combo, or word
- `kind` = the learning behavior

## Examples

### Audio To Romaji

```js
{
  kind: "recognition",
  scope: "kana",
  source: { modality: "audio" },
  responseMode: "mcq",
  answer: { modality: "romaji" }
}
```

Meaning:

- play the sound
- let the user choose the romaji answer

### Kana To Romaji

```js
{
  kind: "recognition",
  scope: "kana",
  source: { modality: "kana" },
  responseMode: "mcq",
  answer: { modality: "romaji" }
}
```

Meaning:

- show the kana
- let the user choose the romaji answer

### Romaji To Kana Typing

```js
{
  kind: "production",
  scope: "kana",
  source: { modality: "romaji" },
  responseMode: "typing",
  answer: { modality: "kana" }
}
```

Meaning:

- show romaji
- ask the user to type the kana

### Romaji To Kana Drawing

```js
{
  kind: "production",
  scope: "kana",
  source: { modality: "romaji" },
  responseMode: "drawing",
  answer: { modality: "kana" }
}
```

Meaning:

- show romaji
- ask the user to draw the kana

### Word Composition

```js
{
  kind: "composition",
  scope: "word",
  source: { modality: "word" },
  responseMode: "ordering",
  answer: { modality: "word" },
  composition: {
    parts: ["su", "shi"],
    output: "すし"
  }
}
```

Meaning:

- the learner builds a word from parts
- this is useful for things like `sushi`

## Legacy Quiz Shape

Older quizzes may still look like this:

```js
{
  question: "What is this kana?",
  options: ["a", "i", "u", "e"],
  correctOption: 0
}
```

The app still supports this shape, but it also stores a structured `quizConfig` so newer quiz types can grow without redesigning the database again.

## Practical Rule For The App

- if `page.type !== "QUIZ"` -> render a normal lesson page
- if `page.type === "QUIZ"` and `quizConfig` exists -> use the new quiz engine
- if `page.type === "QUIZ"` and only legacy fields exist -> fall back to the old MCQ quiz

## Recommended Direction

For long-term flexibility:

- keep one `QUIZ` page type
- use `quizConfig` for all quiz logic
- treat the CMS as a quiz recipe editor
- let the compose app generate these recipes later

That way the same backend can support:

- kana quizzes
- audio quizzes
- romaji quizzes
- drawing quizzes
- word-building quizzes

