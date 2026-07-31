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

  static Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
    String role = 'DONOR',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'fullName': fullName,
        'phone': phone,
        'role': role,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 201 && data['success'] == true) {
      return data['data'];
    } else {
      throw Exception(data['message'] ?? 'Registration failed');
    }
  }

  static Future<Map<String, dynamic>> loginWithGoogle({
    required String googleId,
    required String email,
    required String fullName,
    String? profileImageUrl,
    String role = 'DONOR',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/google'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'googleId': googleId,
        'email': email,
        'fullName': fullName,
        'profileImageUrl': profileImageUrl,
        'role': role,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      authToken = data['data']['accessToken'];
      return data['data'];
    } else {
      throw Exception(data['message'] ?? 'Google Authentication failed');
    }
  }

  static Future<Map<String, dynamic>> sendPhoneOtp(String phone) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/otp/send'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data['data'];
    } else {
      throw Exception(data['message'] ?? 'Failed to send OTP');
    }
  }

  static Future<Map<String, dynamic>> verifyPhoneOtp({
    required String phone,
    required String otpCode,
    String? fullName,
    String? email,
    String role = 'DONOR',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/otp/verify'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'phone': phone,
        'otpCode': otpCode,
        'fullName': fullName,
        'email': email,
        'role': role,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      authToken = data['data']['accessToken'];
      return data['data'];
    } else {
      throw Exception(data['message'] ?? 'OTP verification failed');
    }
  }

  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/forgot-password/request'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data['data'];
    } else {
      throw Exception(data['message'] ?? 'Failed to process forgot password request');
    }
  }

  static Future<Map<String, dynamic>> resetPassword(String resetToken, String newPassword) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/forgot-password/reset'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'resetToken': resetToken, 'newPassword': newPassword}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data['data'];
    } else {
      throw Exception(data['message'] ?? 'Failed to reset password');
    }
  }

  static Future<UserModel> linkAccount({
    required String provider,
    String? googleId,
    String? phone,
    String? email,
    String? password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/link-account'),
      headers: _headers,
      body: jsonEncode({
        'provider': provider,
        'googleId': googleId,
        'phone': phone,
        'email': email,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return UserModel.fromJson(data['data']);
    } else {
      throw Exception(data['message'] ?? 'Failed to link account');
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

  static Future<void> logout() async {
    try {
      await http.post(
        Uri.parse('$baseUrl/auth/logout'),
        headers: _headers,
      );
    } catch (_) {}
    authToken = null;
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
