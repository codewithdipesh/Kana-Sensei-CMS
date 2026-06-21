"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, RotateCcw, Check, X } from "lucide-react"
import { getShuffledMCQWithAnswerIndex, getQuizCorrectAnswer } from "@/lib/quiz"

export default function QuizRenderer({ quizConfig, characterData = null, onCorrect = null, onIncorrect = null }) {
  const [submitted, setSubmitted] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [userInput, setUserInput] = useState("")
  const [isCorrect, setIsCorrect] = useState(null)
  const [shuffledOptions, setShuffledOptions] = useState([])
  const [shuffledCorrectIndex, setShuffledCorrectIndex] = useState(0)
  const audioRef = useRef(null)

  // Initialize MCQ options shuffle
  useEffect(() => {
    if (quizConfig.responseMode === "mcq") {
      const { options, correctIndex } = getShuffledMCQWithAnswerIndex(quizConfig)
      setShuffledOptions(options)
      setShuffledCorrectIndex(correctIndex)
      setSelectedOption(null)
    }
  }, [quizConfig])

  const handlePlayAudio = () => {
    if (characterData?.audioUrl) {
      if (audioRef.current) audioRef.current.pause()
      audioRef.current = new Audio(characterData.audioUrl)
      audioRef.current.play()
    }
  }

  const handleMCQSubmit = () => {
    const isAnswerCorrect = selectedOption === shuffledCorrectIndex
    setIsCorrect(isAnswerCorrect)
    setSubmitted(true)
    
    if (isAnswerCorrect && onCorrect) {
      onCorrect()
    } else if (!isAnswerCorrect && onIncorrect) {
      onIncorrect()
    }
  }

  const handleTypingSubmit = () => {
    const correctAnswer = getQuizCorrectAnswer(quizConfig)
    const acceptedValues = quizConfig.answer?.acceptedValues || []
    const allAccepted = [correctAnswer, ...acceptedValues]
    
    const userTrimmed = String(userInput || "").trim().toLowerCase()
    const isAnswerCorrect = allAccepted.some((val) => 
      String(val || "").trim().toLowerCase() === userTrimmed
    )
    
    setIsCorrect(isAnswerCorrect)
    setSubmitted(true)
    
    if (isAnswerCorrect && onCorrect) {
      onCorrect()
    } else if (!isAnswerCorrect && onIncorrect) {
      onIncorrect()
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setSelectedOption(null)
    setUserInput("")
    setIsCorrect(null)
    if (quizConfig.responseMode === "mcq") {
      const { options, correctIndex } = getShuffledMCQWithAnswerIndex(quizConfig)
      setShuffledOptions(options)
      setShuffledCorrectIndex(correctIndex)
    }
  }

  const promptText = quizConfig.metadata?.title || quizConfig.source?.value || "Quiz Question"
  const hintText = quizConfig.metadata?.hint

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{promptText}</h3>
        {hintText && (
          <p className="text-sm text-gray-600 mt-2 italic">💡 Hint: {hintText}</p>
        )}
      </div>

      {/* Source Display */}
      {!submitted && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {quizConfig.source?.modality === "kana" && characterData && (
            <div className="text-center space-y-3">
              <p className="text-5xl font-bold text-gray-900">{characterData.character}</p>
              <button
                onClick={handlePlayAudio}
                disabled={!characterData.audioUrl}
                className="mx-auto flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                Play Audio
              </button>
              <p className="text-sm text-gray-600">Romaji: <span className="font-semibold">{characterData.romaji}</span></p>
            </div>
          )}
          {quizConfig.source?.modality === "audio" && characterData?.audioUrl && (
            <div className="text-center">
              <button
                onClick={handlePlayAudio}
                className="mx-auto flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                Play Audio
              </button>
            </div>
          )}
          {quizConfig.source?.modality === "svg" && characterData?.svgUrl && (
            <div className="flex justify-center">
              <img src={characterData.svgUrl} alt="Quiz prompt" className="max-h-32 object-contain" />
            </div>
          )}
          {(quizConfig.source?.modality === "romaji" || quizConfig.source?.modality === "text" || quizConfig.source?.modality === "word") && (
            <p className="text-center text-lg font-semibold text-gray-900">{quizConfig.source?.value}</p>
          )}
        </div>
      )}

      {/* MCQ Response */}
      {quizConfig.responseMode === "mcq" && (
        <div className="space-y-3 mb-6">
          {shuffledOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => !submitted && setSelectedOption(index)}
              disabled={submitted}
              className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-all ${
                selectedOption === index
                  ? "border-blue-500 bg-blue-50 text-gray-900"
                  : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
              } ${submitted && index === shuffledCorrectIndex ? "border-green-500 bg-green-50" : ""} ${
                submitted && selectedOption === index && index !== shuffledCorrectIndex
                  ? "border-red-500 bg-red-50"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === index
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  } ${submitted && index === shuffledCorrectIndex ? "border-green-500 bg-green-500" : ""} ${
                    submitted && selectedOption === index && index !== shuffledCorrectIndex
                      ? "border-red-500 bg-red-500"
                      : ""
                  }`}
                >
                  {selectedOption === index && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span>{option}</span>
                {submitted && index === shuffledCorrectIndex && (
                  <Check className="w-5 h-5 text-green-600 ml-auto" />
                )}
                {submitted && selectedOption === index && index !== shuffledCorrectIndex && (
                  <X className="w-5 h-5 text-red-600 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Typing/Text Response */}
      {(quizConfig.responseMode === "typing" || quizConfig.responseMode === "drawing") && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">Your answer:</label>
          <input
            type="text"
            value={userInput}
            onChange={(e) => !submitted && setUserInput(e.target.value)}
            disabled={submitted}
            placeholder="Type your answer..."
            onKeyPress={(e) => {
              if (e.key === "Enter" && !submitted) {
                handleTypingSubmit()
              }
            }}
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-all ${
              submitted && isCorrect
                ? "border-green-500 bg-green-50"
                : submitted && !isCorrect
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 focus:border-blue-500"
            }`}
          />
        </div>
      )}

      {/* Feedback */}
      {submitted && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            isCorrect
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`font-semibold ${
              isCorrect ? "text-green-800" : "text-red-800"
            }`}
          >
            {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
          </p>
          {!isCorrect && (
            <p className="text-sm mt-1 text-gray-700">
              The correct answer is: <span className="font-semibold">{getQuizCorrectAnswer(quizConfig)}</span>
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!submitted ? (
          <button
            onClick={
              quizConfig.responseMode === "mcq"
                ? handleMCQSubmit
                : handleTypingSubmit
            }
            disabled={
              quizConfig.responseMode === "mcq"
                ? selectedOption === null
                : userInput.trim() === ""
            }
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
