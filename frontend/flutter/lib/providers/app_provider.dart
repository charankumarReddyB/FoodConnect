import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/donation_model.dart';
import '../services/api_service.dart';

class AppProvider extends ChangeNotifier {
  UserModel? _currentUser;
  String _selectedRole = 'DONOR';
  String _selectedLanguage = 'en';
  bool _isDarkMode = false;
  List<DonationModel> _nearbyDonations = [];
  bool _isLoading = false;

  UserModel? get currentUser => _currentUser;
  String get selectedRole => _selectedRole;
  String get selectedLanguage => _selectedLanguage;
  bool get isDarkMode => _isDarkMode;
  List<DonationModel> get nearbyDonations => _nearbyDonations;
  bool get isLoading => _isLoading;

  void setRole(String role) {
    _selectedRole = role;
    notifyListeners();
  }

  void setLanguage(String lang) {
    _selectedLanguage = lang;
    notifyListeners();
  }

  void toggleDarkMode() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await ApiService.login(email, password);
      _currentUser = UserModel.fromJson(data['user']);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> fetchNearbyDonations(double lat, double lon) async {
    _isLoading = true;
    notifyListeners();

    _nearbyDonations = await ApiService.getNearbyDonations(lat, lon);
    _isLoading = false;
    notifyListeners();
  }

  void logout() {
    _currentUser = null;
    ApiService.authToken = null;
    notifyListeners();
  }
}
