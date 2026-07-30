class UserModel {
  final String id;
  final String email;
  final String fullName;
  final String? phone;
  final String role;
  final String? profileImageUrl;
  final String? address;
  final double? latitude;
  final double? longitude;
  final bool isActive;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    this.phone,
    required this.role,
    this.profileImageUrl,
    this.address,
    this.latitude,
    this.longitude,
    required this.isActive,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? json['full_name'] ?? 'User',
      phone: json['phone'],
      role: json['role'] ?? 'DONOR',
      profileImageUrl: json['profileImageUrl'] ?? json['profile_image_url'],
      address: json['address'],
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
      isActive: json['isActive'] ?? json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'phone': phone,
      'role': role,
      'profileImageUrl': profileImageUrl,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'isActive': isActive,
    };
  }
}
