import * as fflate from 'fflate';
import { H5P_MANIFEST_TEMPLATE, QUESTION_SET_PARAMS_TEMPLATE } from './h5pTemplates';
import { QuizOutput, MCQQuestion, FITBQuestion, MatchQuestion } from './AIContentTypes';

import { validateH5PQuestionSet, ValidationResult } from './h5pValidator';

/**
 * Transforms our QuizOutput JSON into H5P content.json structure.
 */
export const transformQuizToH5P = (quiz: QuizOutput) => {
  const h5pQuestions = quiz.questions.map((q) => {
    if (quiz.questionType === 'mcq') {
      const mcq = q as MCQQuestion;
      return {
        library: "H5P.MultiChoice 1.16",
        params: {
          question: `<p>${mcq.question}</p>${mcq.latex ? `<p>$$${mcq.latex}$$</p>` : ''}`,
          answers: mcq.answers.map(a => ({
            text: `<div>${a.text}</div>`,
            correct: a.correct,
            tipsAndFeedback: {
              chosenFeedback: `<div>${a.feedback}</div>`,
              notChosenFeedback: ""
            }
          })),
          behaviour: {
            enableRetry: true,
            enableSolutionsButton: true,
            type: "auto",
            singleAnswer: true
          }
        }
      };
    } else if (quiz.questionType === 'fill_in_the_blanks') {
      const fitb = q as FITBQuestion;
      return {
        library: "H5P.Blanks 1.14",
        params: {
          text: "Fill in the missing words",
          questions: [
            `<p>${fitb.sentence}</p>${fitb.latex ? `<p>$$${fitb.latex}$$</p>` : ''}`
          ],
          behaviour: {
            enableRetry: true,
            enableSolutionsButton: true,
            caseSensitive: false
          }
        }
      };
    } else if (quiz.questionType === 'match_the_pair') {
      const match = q as MatchQuestion;
      const textField = match.pairs.map(p => `*${p.left}* is matched with *${p.right}*`).join('. ');
      const distractors = match.distractors.map(d => `*${d}*`).join(' ');
      
      return {
        library: "H5P.DragText 1.10",
        params: {
          taskDescription: match.instruction,
          textField: textField + (distractors ? '. ' + distractors : ''),
          behaviour: {
            enableRetry: true,
            enableSolutionsButton: true,
            instantFeedback: false
          }
        }
      };
    }
    return null;
  }).filter(Boolean);

  return {
    ...QUESTION_SET_PARAMS_TEMPLATE,
    questions: h5pQuestions
  };
};

/**
 * Packs generated content into an H5P zip and triggers download.
 */
export const downloadH5P = async (generatedOutputs: Record<string, any>): Promise<ValidationResult> => {
  const quiz = generatedOutputs['quiz'] as QuizOutput;
  if (!quiz) throw new Error("No quiz content to pack");

  const contentJsonRaw = transformQuizToH5P(quiz);
  
  // Validate BEFORE packaging
  const validation = validateH5PQuestionSet(contentJsonRaw);
  if (!validation.valid) {
    return validation; // Return errors to caller, don't create zip
  }

  const h5pJson = JSON.stringify(H5P_MANIFEST_TEMPLATE, null, 2);
  const contentJson = JSON.stringify(contentJsonRaw, null, 2);

  const zipData: fflate.Zippable = {
    'h5p.json': fflate.strToU8(h5pJson),
    'content': {
      'content.json': fflate.strToU8(contentJson)
    }
  };

  return new Promise<ValidationResult>((resolve, reject) => {
    fflate.zip(zipData, (err, data) => {
      if (err) return reject(err);
      
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-lesson.h5p';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve(validation);
    });
  });
};

