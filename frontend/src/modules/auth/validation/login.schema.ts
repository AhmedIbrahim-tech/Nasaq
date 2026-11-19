import { z } from "zod";

/**
 * Validation schema factory for the Login form matching Backend LoginRequest.
 * Supports dynamic bilingual localization via next-intl translation function.
 */
export const getLoginSchema = (t?: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, {
        message: t ? (t('EmailRequired') || 'Email address is required.') : 'Email address is required.',
      })
      .email({
        message: t ? (t('EmailInvalid') || 'Please enter a valid email address.') : 'Please enter a valid email address.',
      }),
    password: z
      .string()
      .min(1, {
        message: t ? (t('PasswordRequired') || 'Password is required.') : 'Password is required.',
      }),
    rememberMe: z.boolean().default(false),
  });

export const loginSchema = getLoginSchema();
export type LoginFormValues = z.infer<typeof loginSchema>;
