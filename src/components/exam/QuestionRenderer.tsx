'use client';

import React from 'react';
import { QuestionItem } from '@/lib/types';
import { useExamStore } from '@/store/useExamStore';

interface QuestionRendererProps {
  question: QuestionItem;
  questionNumber: number;
}

export function QuestionRenderer({ question, questionNumber }: QuestionRendererProps) {
  const rawAnswer = useExamStore((state) => state.answers[questionNumber]);
  const answer = rawAnswer || '';
  const setAnswer = useExamStore((state) => state.setAnswer);

  const handleSelectOption = (val: string) => {
    setAnswer(questionNumber, val);
  };

  const renderInputControl = () => {
    switch (question.category) {
      case 'TFNG': {
        const options = ['TRUE', 'FALSE', 'NOT GIVEN'];
        return (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3">
            {options.map((opt) => {
              const isChecked = answer.toUpperCase() === opt;
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${questionNumber}`}
                    value={opt}
                    checked={isChecked}
                    onChange={() => handleSelectOption(opt)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-neutral-300 cursor-pointer"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        );
      }

      case 'YNNG': {
        const options = ['YES', 'NO', 'NOT GIVEN'];
        return (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3">
            {options.map((opt) => {
              const isChecked = answer.toUpperCase() === opt;
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${questionNumber}`}
                    value={opt}
                    checked={isChecked}
                    onChange={() => handleSelectOption(opt)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-neutral-300 cursor-pointer"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        );
      }

      case 'MCQ_SINGLE': {
        const options = question.options || [];
        return (
          <div className="space-y-2 mt-3">
            {options.map((opt, idx) => {
              const isChecked = answer === opt;
              return (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 font-medium'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${questionNumber}`}
                    value={opt}
                    checked={isChecked}
                    onChange={() => handleSelectOption(opt)}
                    className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-neutral-300 cursor-pointer"
                  />
                  <span className="leading-snug">{opt}</span>
                </label>
              );
            })}
          </div>
        );
      }

      case 'MATCHING_HEADINGS': {
        const options = question.options || [];
        return (
          <div className="mt-3">
            <select
              value={answer}
              onChange={(e) => handleSelectOption(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Select Heading --</option>
              {options.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );
      }

      case 'FILL_BLANKS':
      case 'SUMMARY_COMPLETION':
      default: {
        return (
          <div className="mt-3">
            <input
              type="text"
              value={answer}
              onChange={(e) => handleSelectOption(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full sm:max-w-md p-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        );
      }
    }
  };

  return (
    <div
      id={`question-${questionNumber}`}
      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/60 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-neutral-800 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-neutral-700">
          {questionNumber}
        </span>
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed">
            {question.promptText}
          </p>
          {renderInputControl()}
        </div>
      </div>
    </div>
  );
}