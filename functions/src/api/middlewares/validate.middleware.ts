import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation rules for signup
 */
export const validateSignup = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .matches(/^[a-zA-Z0-9_]{3,20}$/)
        .withMessage('Username must be 3-20 characters (letters, numbers, underscore only)'),

    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Invalid Indian phone number (must be 10 digits starting with 6-9)'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    handleValidationErrors,
];

/**
 * Validation rules for login
 */
export const validateLogin = [
    body('identifier')
        .trim()
        .notEmpty()
        .withMessage('Email or username is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors,
];

/**
 * Validation rules for profile update
 */
export const validateProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('phone')
        .optional()
        .trim()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Invalid Indian phone number'),

    body('username')
        .optional()
        .trim()
        .matches(/^[a-zA-Z0-9_]{3,20}$/)
        .withMessage('Username must be 3-20 characters'),

    handleValidationErrors,
];

/**
 * Middleware to handle validation errors
 */
function handleValidationErrors(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            errors: errors.array().map((err) => ({
                field: err.type === 'field' ? err.path : undefined,
                message: err.msg,
            })),
        });
        return;
    }

    next();
}

export default {
    validateSignup,
    validateLogin,
    validateProfileUpdate,
};
