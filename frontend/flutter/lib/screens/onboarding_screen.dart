import 'package:flutter/material.dart';
import 'role_select_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, String>> _pages = [
    {
      'title': 'Post Surplus Food',
      'desc': 'Share extra food from events, restaurants, or home with local communities.',
      'icon': '🍲',
    },
    {
      'title': 'Real-Time Map Match',
      'desc': 'GPS precision connects nearby NGOs, shelters, and orphanages in minutes.',
      'icon': '📍',
    },
    {
      'title': 'Verified Delivery',
      'desc': 'Trained volunteers pick up and deliver food with OTP code verification.',
      'icon': '🚴‍♂️',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const SizedBox(width: 40),
                  TextButton(
                    onPressed: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => const RoleSelectScreen()),
                      );
                    },
                    child: const Text('Skip', style: TextStyle(color: Color(0xFF64748B))),
                  ),
                ],
              ),
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: (idx) => setState(() => _currentPage = idx),
                  itemCount: _pages.length,
                  itemBuilder: (context, index) {
                    final item = _pages[index];
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(item['icon']!, style: const TextStyle(fontSize: 80)),
                        const SizedBox(height: 32),
                        Text(
                          item['title']!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 26, fontWeight: FontWeight.extrabold),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          item['desc']!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Color(0xFF64748B), fontSize: 15, height: 1.4),
                        ),
                      ],
                    );
                  },
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _pages.length,
                  (index) => AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    height: 8,
                    width: _currentPage == index ? 24 : 8,
                    decoration: BoxDecoration(
                      color: _currentPage == index ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (_currentPage < _pages.length - 1) {
                      _pageController.nextPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    } else {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => const RoleSelectScreen()),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(
                    _currentPage == _pages.length - 1 ? 'Get Started' : 'Next',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
