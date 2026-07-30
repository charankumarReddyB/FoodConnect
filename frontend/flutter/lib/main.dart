import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/app_provider.dart';
import 'screens/splash_screen.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppProvider(),
      child: const FoodConnectApp(),
    ),
  );
}

class FoodConnectApp extends StatelessWidget {
  const FoodConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppProvider>(
      builder: (context, provider, child) {
        return MaterialApp(
          title: 'FoodConnect India',
          debugShowCheckedModeBanner: false,
          themeMode: provider.isDarkMode ? ThemeMode.dark : ThemeMode.light,
          theme: ThemeData(
            useMaterial3: true,
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF059669),
              primary: const Color(0xFF059669),
              secondary: const Color(0xFFF59E0B),
              background: const Color(0xFFF8FAFC),
              surface: Colors.white,
            ),
            textTheme: GoogleFonts.plusJakartaSansTextTheme(
              Theme.of(context).textTheme,
            ),
          ),
          darkTheme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.dark,
            colorScheme: ColorScheme.fromSeed(
              brightness: Brightness.dark,
              seedColor: const Color(0xFF10B981),
              primary: const Color(0xFF10B981),
              secondary: const Color(0xFFFBBF24),
              background: const Color(0xFF0F172A),
              surface: const Color(0xFF1E293B),
            ),
            textTheme: GoogleFonts.plusJakartaSansTextTheme(
              ThemeData.dark().textTheme,
            ),
          ),
          home: const SplashScreen(),
        );
      },
    );
  }
}
