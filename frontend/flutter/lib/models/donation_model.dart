class DonationModel {
  final String id;
  final String donorId;
  final String donorName;
  final String title;
  final String? description;
  final String foodType;
  final String quantityDescription;
  final int estimatedServings;
  final String preparedTime;
  final String expiryTime;
  final String pickupAddress;
  final double latitude;
  final double longitude;
  final String deliveryMethod;
  final String status;
  final List<String>? imageUrls;

  DonationModel({
    required this.id,
    required this.donorId,
    required this.donorName,
    required this.title,
    this.description,
    required this.foodType,
    required this.quantityDescription,
    required this.estimatedServings,
    required this.preparedTime,
    required this.expiryTime,
    required this.pickupAddress,
    required this.latitude,
    required this.longitude,
    required this.deliveryMethod,
    required this.status,
    this.imageUrls,
  });

  factory DonationModel.fromJson(Map<String, dynamic> json) {
    return DonationModel(
      id: json['id'] ?? '',
      donorId: json['donorId'] ?? json['donor_id'] ?? '',
      donorName: json['donorName'] ?? json['donor_name'] ?? 'Donor',
      title: json['title'] ?? 'Food Donation',
      description: json['description'],
      foodType: json['foodType'] ?? json['food_type'] ?? 'VEG',
      quantityDescription: json['quantityDescription'] ?? json['quantity_description'] ?? '10 kg',
      estimatedServings: json['estimatedServings'] ?? json['estimated_servings'] ?? 20,
      preparedTime: json['preparedTime'] ?? '',
      expiryTime: json['expiryTime'] ?? '',
      pickupAddress: json['pickupAddress'] ?? json['pickup_address'] ?? '',
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : 12.9716,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : 77.5946,
      deliveryMethod: json['deliveryMethod'] ?? json['delivery_method'] ?? 'VOLUNTEER_DELIVERY',
      status: json['status'] ?? 'CREATED',
      imageUrls: json['imageUrls'] != null ? List<String>.from(json['imageUrls']) : null,
    );
  }
}
