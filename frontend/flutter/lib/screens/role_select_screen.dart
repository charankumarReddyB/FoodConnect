import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import 'login_screen.dart';

class RoleSelectScreen extends StatelessWidget {
  const RoleSelectScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final roles = [
      {
        'id': 'DONOR',
        'title': 'Food Donor',
        'desc': 'Restaurants, caterers, households, and event organizers.',
        'icon': Icons.volunteer_activism_rounded,
        'color': const Color(0xFF059669),
        'bg': const Color(0xFFECFDF5),
      },
      {
        'id': 'RECIPIENT',
        'title': 'Recipient Org',
        'desc': 'Orphanages, old-age homes, shelters, and NGOs seeking food.',
        'icon': Icons.corporate_fare_rounded,
        'color': const Color(0xFF2563EB),
        'bg': const Color(0xFFEFF6FF),
      },
      {
        'id': 'VOLUNTEER',
        'title': 'Volunteer',
        'desc': 'Community members who pick up and deliver food on their schedule.',
        'icon': Icons.directions_bike_rounded,
        'color': const Color(0xFF9333EA),
        'bg': const Color(0xFFF3E8FF),
      },
      {
        'id': 'ADMIN',
        'title': 'Administrator',
        'desc': 'Platform admins who verify NGOs and monitor system metrics.',
        'icon': Icons.admin_panel_settings_rounded,
        'color': const Color(0xFFE11D48),
        'bg': const Color(0xFFFFE4E6),
      },
    ];

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 20),
              Center(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.favorite_rounded,
                    color: Color(0xFF059669),
                    size: 36,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'How do you want to help?',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.extrabold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Select your role to get a tailored food-saving experience.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
              ),
              const SizedBox(height: 32),
              Expanded(
                child: ListView.separated(
                  itemCount: roles.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    final r = roles[index];
                    return InkWell(
                      onTap: () {
                        context.read<AppProvider>().setRole(r['id'] as String);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => LoginScreen(role: r['id'] as String),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: r['bg'] as Color,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(r['icon'] as IconData, color: r['color'] as Color, size: 28),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    r['title'] as String,
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    r['desc'] as String,
                                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Color(0xFF94A3B8)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
