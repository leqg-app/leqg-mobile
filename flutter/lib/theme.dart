import 'package:flutter/material.dart';

// Port de src/theme.js : mêmes couleurs MD3 clair/sombre.
const ColorScheme lightColorScheme = ColorScheme(
  brightness: Brightness.light,
  primary: Color(0xFF163033),
  onPrimary: Color(0xFFFFFFFF),
  primaryContainer: Color(0xFF88F3FF),
  onPrimaryContainer: Color(0xFF001F23),
  secondary: Color(0xFF4A6366),
  onSecondary: Color(0xFFFFFFFF),
  secondaryContainer: Color(0xFFCDE7EB),
  onSecondaryContainer: Color(0xFF051F22),
  tertiary: Color(0xFF505E7D),
  onTertiary: Color(0xFFFFFFFF),
  tertiaryContainer: Color(0xFFD8E2FF),
  onTertiaryContainer: Color(0xFF0C1B36),
  error: Color(0xFFBA1A1A),
  onError: Color(0xFFFFFFFF),
  errorContainer: Color(0xFFFFDAD6),
  onErrorContainer: Color(0xFF410002),
  surface: Color(0xFFFAFDFD),
  onSurface: Color(0xFF191C1D),
  surfaceContainerHighest: Color(0xFFDAE4E5),
  onSurfaceVariant: Color(0xFF3F484A),
  outline: Color(0xFF6F797A),
  outlineVariant: Color(0xFFBEC8C9),
  shadow: Color(0xFF000000),
  scrim: Color(0xFF000000),
  inverseSurface: Color(0xFF2D3131),
  onInverseSurface: Color(0xFFEFF1F1),
  inversePrimary: Color(0xFF4DD8E7),
);

const ColorScheme darkColorScheme = ColorScheme(
  brightness: Brightness.dark,
  primary: Color(0xFFF57C00),
  onPrimary: Color(0xFF00363B),
  primaryContainer: Color(0xFF004F56),
  onPrimaryContainer: Color(0xFF88F3FF),
  secondary: Color(0xFFB1CBCF),
  onSecondary: Color(0xFF1C3437),
  secondaryContainer: Color(0xFF324B4E),
  onSecondaryContainer: Color(0xFFCDE7EB),
  tertiary: Color(0xFFFFB957),
  onTertiary: Color(0xFF462B00),
  tertiaryContainer: Color(0xFF643F00),
  onTertiaryContainer: Color(0xFFFFDDB5),
  error: Color(0xFFFFB4AB),
  onError: Color(0xFF690005),
  errorContainer: Color(0xFF93000A),
  onErrorContainer: Color(0xFFFFB4AB),
  surface: Color(0xFF191C1D),
  onSurface: Color(0xFFE0E3E3),
  surfaceContainerHighest: Color(0xFF3F484A),
  onSurfaceVariant: Color(0xFFBEC8C9),
  outline: Color(0xFF899294),
  outlineVariant: Color(0xFF3F484A),
  shadow: Color(0xFF000000),
  scrim: Color(0xFF000000),
  inverseSurface: Color(0xFFE0E3E3),
  onInverseSurface: Color(0xFF2D3131),
  inversePrimary: Color(0xFF006971),
);

// Couleurs annexes (src/constants.js)
const Color accentColor = Color(0xFFF9A825);
const Color dangerColor = Color(0xFFB00020);

ThemeData buildTheme(Brightness brightness) {
  final scheme =
      brightness == Brightness.dark ? darkColorScheme : lightColorScheme;
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: scheme.surface,
    appBarTheme: AppBarTheme(
      backgroundColor: scheme.surface,
      foregroundColor: scheme.onSurface,
    ),
  );
}
