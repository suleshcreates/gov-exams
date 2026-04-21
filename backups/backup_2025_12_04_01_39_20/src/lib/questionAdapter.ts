import logger from './logger';

/**
 * Database Question Format (from admin panel)
 */
export interface DBQuestion {
    id: string;
    question_set_id: string;
    question_text: string;
    question_text_marathi: string;
    option_1: string;
    option_1_marathi: string;
    option_2: string;
    option_2_marathi: string;
    option_3: string;
    option_3_marathi: string;
    option_4: string;
    option_4_marathi: string;
    correct_answer: number; // 0-3 (index)
    order_index: number;
}

/**
 * Exam Question Format (for display)
 * Compatible with existing ExamStart.tsx
 */
export interface ExamQuestion {
    id: string;
    questionText: string;
    questionTextMarathi: string;
    options: string[];
    optionsMarathi: string[];
    correctAnswer: number;
}

/**
 * Convert database question to exam question format
 */
export function dbQuestionToExamQuestion(dbQuestion: DBQuestion): ExamQuestion {
    return {
        id: dbQuestion.id,
        questionText: dbQuestion.question_text,
        questionTextMarathi: dbQuestion.question_text_marathi || '',
        options: [
            dbQuestion.option_1,
            dbQuestion.option_2,
            dbQuestion.option_3,
            dbQuestion.option_4,
        ],
        optionsMarathi: [
            dbQuestion.option_1_marathi || '',
            dbQuestion.option_2_marathi || '',
            dbQuestion.option_3_marathi || '',
            dbQuestion.option_4_marathi || '',
        ],
        correctAnswer: dbQuestion.correct_answer,
    };
}

/**
 * Convert array of database questions to exam questions
 */
export function convertDBQuestions(dbQuestions: DBQuestion[]): ExamQuestion[] {
    return dbQuestions
        .sort((a, b) => a.order_index - b.order_index)
        .map(dbQuestionToExamQuestion);
}

/**
 * Check if question has Marathi translations
 */
export function hasMarathiTranslation(question: ExamQuestion): boolean {
    return (
        question.questionTextMarathi.trim() !== '' &&
        question.optionsMarathi.some(opt => opt.trim() !== '')
    );
}

/**
 * Log question conversion for debugging
 */
export function logQuestionConversion(dbQuestion: DBQuestion, examQuestion: ExamQuestion): void {
    logger.debug('Question Conversion:', {
        id: dbQuestion.id,
        hasMarathi: hasMarathiTranslation(examQuestion),
        optionsCount: examQuestion.options.length,
    });
}
