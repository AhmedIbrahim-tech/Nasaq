import _ from 'lodash';
import { createTheme } from '@mui/material/styles';
import { CustomizerContext } from "@/theme/customizerContext";
import { useContext, useEffect } from 'react';
import components from './Components';
import typography, { buildTypography } from './Typography';
import { shadows, darkshadows } from './Shadows';
import { DarkThemeColors } from './DarkThemeColors';
import { LightThemeColors } from './LightThemeColors';
import { baseDarkTheme, baselightTheme } from './DefaultColors';
import { arSA, enUS } from '@mui/material/locale';

export const BuildTheme = (config: any = {}) => {
  const themeOptions = LightThemeColors.find((theme) => theme.name === config.theme);
  const darkthemeOptions = DarkThemeColors.find((theme) => theme.name === config.theme);
  const { activeMode, isBorderRadius, isLanguage } = useContext(CustomizerContext);
  const defaultTheme = activeMode === 'dark' ? baseDarkTheme : baselightTheme;
  const defaultShadow = activeMode === 'dark' ? darkshadows : shadows;
  const themeSelect = activeMode === 'dark' ? darkthemeOptions : themeOptions;
  const currentLang = config.language || isLanguage;
  const muiLocale = currentLang === 'ar' ? arSA : enUS;

  const baseMode = {
    palette: {
      mode: activeMode,
    },
    shape: {
      borderRadius: isBorderRadius,
    },
    shadows: defaultShadow,
    typography: buildTypography(currentLang === 'ar'),
  };
  const theme = createTheme(
    _.merge({}, baseMode, defaultTheme, themeSelect, {
      direction: config.direction,
    }) as any,
    muiLocale,
  );
  theme.components = components(theme);

  return theme;
};

const ThemeSettings = () => {
  const { activeDir, activeTheme, isLanguage } = useContext(CustomizerContext);

  const theme = BuildTheme({
    direction: activeDir,
    theme: activeTheme,
    language: isLanguage,
  });
  useEffect(() => {
    document.dir = activeDir;
    document.documentElement.lang = isLanguage;
    document.documentElement.dir = activeDir;
  }, [activeDir, isLanguage]);

  return theme;
};

export { ThemeSettings };
