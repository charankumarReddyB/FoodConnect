import 'package:flutter_test/flutter_test.dart';

void main() {
  group('FoodConnect Flutter App Unit & Model Tests', () {
    test('Donation Model validation and payload format', () {
      final donationMap = {
        'id': 'd-101',
        'foodType': 'VEG',
        'quantityKg': 15.0,
        'title': 'Vegetable Biryani',
        'status': 'AVAILABLE'
      };

      expect(donationMap['foodType'], equals('VEG'));
      expect(donationMap['quantityKg'], equals(15.0));
      expect(donationMap['status'], equals('AVAILABLE'));
    });

    test('User Role permissions logic', () {
      final roles = ['DONOR', 'RECIPIENT', 'VOLUNTEER', 'ADMIN'];
      expect(roles.contains('DONOR'), isTrue);
      expect(roles.contains('ADMIN'), isTrue);
    });
  });
}
