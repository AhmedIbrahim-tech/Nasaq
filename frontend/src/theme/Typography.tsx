import { Plus_Jakarta_Sans } from "next/font/google";

export const plus = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const buildTypography = (isArabic: boolean = false): any => ({
  fontFamily: isArabic
    ? ['Cairo', 'Segoe UI', 'Tahoma', 'Arial', plus.style.fontFamily, 'sans-serif'].join(', ')
    : [plus.style.fontFamily, 'Cairo', 'Segoe UI', 'Tahoma', 'Arial', 'sans-serif'].join(', '),
  h1: {
    fontWeight: 600,
    fontSize: '2.25rem',
    lineHeight: isArabic ? '3rem' : '2.75rem',
  },
  h2: {
    fontWeight: 600,
    fontSize: '1.875rem',
    lineHeight: isArabic ? '2.5rem' : '2.25rem',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: isArabic ? '2rem' : '1.75rem',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.3125rem',
    lineHeight: isArabic ? '1.8rem' : '1.6rem',
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: isArabic ? '1.75rem' : '1.6rem',
  },
  h6: {
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: isArabic ? '1.4rem' : '1.2rem',
  },
  button: {
    textTransform: 'capitalize',
    fontWeight: isArabic ? 600 : 500,
  },
  body1: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: isArabic ? '1.6rem' : '1.334rem',
  },
  body2: {
    fontSize: isArabic ? '0.8125rem' : '0.75rem',
    letterSpacing: isArabic ? '0' : '0rem',
    fontWeight: 400,
    lineHeight: isArabic ? '1.4rem' : '1rem',
  },
  subtitle1: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: isArabic ? '1.5rem' : '1.35rem',
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: isArabic ? '1.5rem' : '1.35rem',
  },
  caption: {
    fontSize: isArabic ? '0.775rem' : '0.75rem',
    lineHeight: isArabic ? '1.35rem' : '1.25rem',
  },
});

const typography: any = buildTypography(false);

export default typography;
