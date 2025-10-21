import 'package:json_annotation/json_annotation.dart';

part 'community_model.g.dart';

/// Community data model with JSON serialization
@JsonSerializable()
class CommunityModel {
  final String id;
  final String name;
  final String description;
  @JsonKey(name: 'is_private')
  final bool isPrivate;
  @JsonKey(name: 'member_count')
  final int memberCount;
  @JsonKey(name: 'created_by')
  final String createdBy;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  final String? category;
  @JsonKey(name: 'cover_image_url')
  final String? coverImageUrl;
  @JsonKey(name: 'posts_count')
  final int postsCount;
  @JsonKey(name: 'is_member')
  final bool isMember;
  @JsonKey(name: 'is_admin')
  final bool isAdmin;
  final List<String>? tags;
  final Map<String, dynamic>? rules;
  final Map<String, dynamic>? settings;

  const CommunityModel({
    required this.id,
    required this.name,
    required this.description,
    this.isPrivate = false,
    this.memberCount = 0,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
    this.category,
    this.coverImageUrl,
    this.postsCount = 0,
    this.isMember = false,
    this.isAdmin = false,
    this.tags,
    this.rules,
    this.settings,
  });

  /// Create CommunityModel from JSON
  factory CommunityModel.fromJson(Map<String, dynamic> json) =>
      _$CommunityModelFromJson(json);

  /// Convert CommunityModel to JSON
  Map<String, dynamic> toJson() => _$CommunityModelToJson(this);

  /// Create a copy of CommunityModel with updated values
  CommunityModel copyWith({
    String? id,
    String? name,
    String? description,
    bool? isPrivate,
    int? memberCount,
    String? createdBy,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? category,
    String? coverImageUrl,
    int? postsCount,
    bool? isMember,
    bool? isAdmin,
    List<String>? tags,
    Map<String, dynamic>? rules,
    Map<String, dynamic>? settings,
  }) {
    return CommunityModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      isPrivate: isPrivate ?? this.isPrivate,
      memberCount: memberCount ?? this.memberCount,
      createdBy: createdBy ?? this.createdBy,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      category: category ?? this.category,
      coverImageUrl: coverImageUrl ?? this.coverImageUrl,
      postsCount: postsCount ?? this.postsCount,
      isMember: isMember ?? this.isMember,
      isAdmin: isAdmin ?? this.isAdmin,
      tags: tags ?? this.tags,
      rules: rules ?? this.rules,
      settings: settings ?? this.settings,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CommunityModel &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          name == other.name;

  @override
  int get hashCode => id.hashCode ^ name.hashCode;

  @override
  String toString() {
    return 'CommunityModel{id: $id, name: $name, description: $description, memberCount: $memberCount, isPrivate: $isPrivate}';
  }
}
