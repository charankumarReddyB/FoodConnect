import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';
import '../models/donation_model.dart';

class ApiService {
  static String baseUrl = 'http://localhost:8080/api/v1';
  static String? authToken;

  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (authToken != null && authToken!.isNotEmpty)
          'Authorization': 'Bearer $authToken',
      };

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      authToken = data['data']['accessToken'];
      return data['data'];
    } else {
      throw Exception(data['message'] ?? 'Login failed');
    }
  }

  static Future<UserModel> getCurrentUser() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return UserModel.fromJson(data['data']);
    } else {
      throw Exception(data['message'] ?? 'Failed to fetch profile');
    }
  }

  static Future<List<DonationModel>> getNearbyDonations(
      double lat, double lon, {double radiusKm = 15.0}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/donations/nearby?latitude=$lat&longitude=$lon&radiusKm=$radiusKm'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      final List list = data['data'] ?? [];
      return list.map((e) => DonationModel.fromJson(e)).toList();
    } else {
      return [];
    }
  }

  static Future<DonationModel> createDonation(Map<String, dynamic> donationData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/donations'),
      headers: _headers,
      body: jsonEncode(donationData),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return DonationModel.fromJson(data['data']);
    } else {
      throw Exception(data['message'] ?? 'Failed to post donation');
    }
  }
}
