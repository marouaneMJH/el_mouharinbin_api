import 'dart:io';
import 'package:dio/dio.dart';
import 'api_client.dart';
import '../../core/error/failures.dart';

/// Remote data source for community management operations
abstract class CommunityRemoteDataSource {
  Future<Map<String, dynamic>> getCommunitiesList({
    int page = 1,
    int limit = 20,
    String? search,
    String? category,
    String? sortBy,
    String? sortOrder,
  });

  Future<Map<String, dynamic>> getCommunityDetails(String communityId);

  Future<Map<String, dynamic>> createCommunity({
    required String name,
    required String description,
    String? category,
    bool isPrivate = false,
    File? coverImage,
  });

  Future<Map<String, dynamic>> updateCommunity({
    required String communityId,
    Map<String, dynamic>? communityData,
    File? coverImage,
  });

  Future<void> deleteCommunity(String communityId);

  Future<Map<String, dynamic>> joinCommunity(String communityId);

  Future<void> leaveCommunity(String communityId);

  Future<Map<String, dynamic>> getCommunityMembers({
    required String communityId,
    int page = 1,
    int limit = 20,
    String? search,
  });

  Future<Map<String, dynamic>> getCommunityPosts({
    required String communityId,
    int page = 1,
    int limit = 20,
    String? sortBy,
    String? sortOrder,
  });

  Future<Map<String, dynamic>> createCommunityPost({
    required String communityId,
    required String content,
    String? title,
    List<File>? attachments,
  });

  Future<Map<String, dynamic>> getCommunityPost({
    required String communityId,
    required String postId,
  });

  Future<Map<String, dynamic>> updateCommunityPost({
    required String communityId,
    required String postId,
    String? content,
    String? title,
  });

  Future<void> deleteCommunityPost({
    required String communityId,
    required String postId,
  });

  Future<Map<String, dynamic>> likeCommunityPost({
    required String communityId,
    required String postId,
  });

  Future<void> unlikeCommunityPost({
    required String communityId,
    required String postId,
  });

  Future<Map<String, dynamic>> getPostComments({
    required String communityId,
    required String postId,
    int page = 1,
    int limit = 20,
  });

  Future<Map<String, dynamic>> createPostComment({
    required String communityId,
    required String postId,
    required String content,
    String? parentCommentId,
  });

  Future<Map<String, dynamic>> updatePostComment({
    required String communityId,
    required String postId,
    required String commentId,
    required String content,
  });

  Future<void> deletePostComment({
    required String communityId,
    required String postId,
    required String commentId,
  });

  Future<Map<String, dynamic>> reportCommunity({
    required String communityId,
    required String reason,
    String? description,
  });

  Future<Map<String, dynamic>> reportCommunityPost({
    required String communityId,
    required String postId,
    required String reason,
    String? description,
  });

  Future<Map<String, dynamic>> getCommunityRules(String communityId);

  Future<Map<String, dynamic>> updateCommunityRules({
    required String communityId,
    required List<Map<String, dynamic>> rules,
  });
}

/// Implementation of CommunityRemoteDataSource
class CommunityRemoteDataSourceImpl implements CommunityRemoteDataSource {
  final ApiClient _apiClient;

  CommunityRemoteDataSourceImpl({required ApiClient apiClient})
    : _apiClient = apiClient;

  @override
  Future<Map<String, dynamic>> getCommunitiesList({
    int page = 1,
    int limit = 20,
    String? search,
    String? category,
    String? sortBy,
    String? sortOrder,
  }) async {
    try {
      final queryParameters = <String, dynamic>{'page': page, 'limit': limit};

      if (search != null && search.isNotEmpty) {
        queryParameters['search'] = search;
      }

      if (category != null) {
        queryParameters['category'] = category;
      }

      if (sortBy != null) {
        queryParameters['sort_by'] = sortBy;
      }

      if (sortOrder != null) {
        queryParameters['sort_order'] = sortOrder;
      }

      final response = await _apiClient.get(
        '/communities',
        queryParameters: queryParameters,
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get communities list failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get communities list: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getCommunityDetails(String communityId) async {
    try {
      final response = await _apiClient.get('/communities/$communityId');

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get community details failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get community details: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> createCommunity({
    required String name,
    required String description,
    String? category,
    bool isPrivate = false,
    File? coverImage,
  }) async {
    try {
      Response response;

      if (coverImage != null) {
        // Create multipart form data for file upload
        final formData = FormData();

        // Add cover image
        formData.files.add(
          MapEntry(
            'cover_image',
            await MultipartFile.fromFile(
              coverImage.path,
              filename: 'cover.jpg',
            ),
          ),
        );

        // Add other community data
        formData.fields.addAll([
          MapEntry('name', name),
          MapEntry('description', description),
          MapEntry('is_private', isPrivate.toString()),
        ]);

        if (category != null) {
          formData.fields.add(MapEntry('category', category));
        }

        response = await _apiClient.post(
          '/communities',
          data: formData,
          options: Options(contentType: 'multipart/form-data'),
        );
      } else {
        // Regular JSON creation
        response = await _apiClient.post(
          '/communities',
          data: {
            'name': name,
            'description': description,
            'is_private': isPrivate,
            if (category != null) 'category': category,
          },
        );
      }

      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Create community failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to create community: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> updateCommunity({
    required String communityId,
    Map<String, dynamic>? communityData,
    File? coverImage,
  }) async {
    try {
      Response response;

      if (coverImage != null) {
        // Create multipart form data for file upload
        final formData = FormData();

        // Add cover image
        formData.files.add(
          MapEntry(
            'cover_image',
            await MultipartFile.fromFile(
              coverImage.path,
              filename: 'cover.jpg',
            ),
          ),
        );

        // Add other community data
        if (communityData != null) {
          communityData.forEach((key, value) {
            formData.fields.add(MapEntry(key, value.toString()));
          });
        }

        response = await _apiClient.put(
          '/communities/$communityId',
          data: formData,
          options: Options(contentType: 'multipart/form-data'),
        );
      } else {
        // Regular JSON update
        response = await _apiClient.put(
          '/communities/$communityId',
          data: communityData ?? {},
        );
      }

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Update community failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to update community: ${e.toString()}');
    }
  }

  @override
  Future<void> deleteCommunity(String communityId) async {
    try {
      final response = await _apiClient.delete('/communities/$communityId');

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException(
          'Delete community failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to delete community: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> joinCommunity(String communityId) async {
    try {
      final response = await _apiClient.post('/communities/$communityId/join');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Join community failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to join community: ${e.toString()}');
    }
  }

  @override
  Future<void> leaveCommunity(String communityId) async {
    try {
      final response = await _apiClient.post('/communities/$communityId/leave');

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException(
          'Leave community failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to leave community: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getCommunityMembers({
    required String communityId,
    int page = 1,
    int limit = 20,
    String? search,
  }) async {
    try {
      final queryParameters = <String, dynamic>{'page': page, 'limit': limit};

      if (search != null && search.isNotEmpty) {
        queryParameters['search'] = search;
      }

      final response = await _apiClient.get(
        '/communities/$communityId/members',
        queryParameters: queryParameters,
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get community members failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get community members: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getCommunityPosts({
    required String communityId,
    int page = 1,
    int limit = 20,
    String? sortBy,
    String? sortOrder,
  }) async {
    try {
      final queryParameters = <String, dynamic>{'page': page, 'limit': limit};

      if (sortBy != null) {
        queryParameters['sort_by'] = sortBy;
      }

      if (sortOrder != null) {
        queryParameters['sort_order'] = sortOrder;
      }

      final response = await _apiClient.get(
        '/communities/$communityId/posts',
        queryParameters: queryParameters,
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get community posts failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get community posts: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> createCommunityPost({
    required String communityId,
    required String content,
    String? title,
    List<File>? attachments,
  }) async {
    try {
      Response response;

      if (attachments != null && attachments.isNotEmpty) {
        // Create multipart form data for file upload
        final formData = FormData();

        // Add attachments
        for (int i = 0; i < attachments.length; i++) {
          formData.files.add(
            MapEntry(
              'attachments',
              await MultipartFile.fromFile(
                attachments[i].path,
                filename: 'attachment_$i.jpg',
              ),
            ),
          );
        }

        // Add post data
        formData.fields.add(MapEntry('content', content));
        if (title != null) {
          formData.fields.add(MapEntry('title', title));
        }

        response = await _apiClient.post(
          '/communities/$communityId/posts',
          data: formData,
          options: Options(contentType: 'multipart/form-data'),
        );
      } else {
        // Regular JSON creation
        response = await _apiClient.post(
          '/communities/$communityId/posts',
          data: {'content': content, if (title != null) 'title': title},
        );
      }

      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Create community post failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to create community post: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getCommunityPost({
    required String communityId,
    required String postId,
  }) async {
    try {
      final response = await _apiClient.get(
        '/communities/$communityId/posts/$postId',
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get community post failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get community post: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> updateCommunityPost({
    required String communityId,
    required String postId,
    String? content,
    String? title,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (content != null) data['content'] = content;
      if (title != null) data['title'] = title;

      final response = await _apiClient.put(
        '/communities/$communityId/posts/$postId',
        data: data,
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Update community post failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to update community post: ${e.toString()}');
    }
  }

  @override
  Future<void> deleteCommunityPost({
    required String communityId,
    required String postId,
  }) async {
    try {
      final response = await _apiClient.delete(
        '/communities/$communityId/posts/$postId',
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException(
          'Delete community post failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to delete community post: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> likeCommunityPost({
    required String communityId,
    required String postId,
  }) async {
    try {
      final response = await _apiClient.post(
        '/communities/$communityId/posts/$postId/like',
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Like community post failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to like community post: ${e.toString()}');
    }
  }

  @override
  Future<void> unlikeCommunityPost({
    required String communityId,
    required String postId,
  }) async {
    try {
      final response = await _apiClient.delete(
        '/communities/$communityId/posts/$postId/like',
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException(
          'Unlike community post failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to unlike community post: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getPostComments({
    required String communityId,
    required String postId,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        '/communities/$communityId/posts/$postId/comments',
        queryParameters: {'page': page, 'limit': limit},
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get post comments failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get post comments: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> createPostComment({
    required String communityId,
    required String postId,
    required String content,
    String? parentCommentId,
  }) async {
    try {
      final response = await _apiClient.post(
        '/communities/$communityId/posts/$postId/comments',
        data: {
          'content': content,
          if (parentCommentId != null) 'parent_comment_id': parentCommentId,
        },
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Create post comment failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to create post comment: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> updatePostComment({
    required String communityId,
    required String postId,
    required String commentId,
    required String content,
  }) async {
    try {
      final response = await _apiClient.put(
        '/communities/$communityId/posts/$postId/comments/$commentId',
        data: {'content': content},
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Update post comment failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to update post comment: ${e.toString()}');
    }
  }

  @override
  Future<void> deletePostComment({
    required String communityId,
    required String postId,
    required String commentId,
  }) async {
    try {
      final response = await _apiClient.delete(
        '/communities/$communityId/posts/$postId/comments/$commentId',
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException(
          'Delete post comment failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to delete post comment: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> reportCommunity({
    required String communityId,
    required String reason,
    String? description,
  }) async {
    try {
      final response = await _apiClient.post(
        '/communities/$communityId/report',
        data: {
          'reason': reason,
          if (description != null) 'description': description,
        },
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Report community failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to report community: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> reportCommunityPost({
    required String communityId,
    required String postId,
    required String reason,
    String? description,
  }) async {
    try {
      final response = await _apiClient.post(
        '/communities/$communityId/posts/$postId/report',
        data: {
          'reason': reason,
          if (description != null) 'description': description,
        },
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Report community post failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to report community post: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> getCommunityRules(String communityId) async {
    try {
      final response = await _apiClient.get('/communities/$communityId/rules');

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Get community rules failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get community rules: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> updateCommunityRules({
    required String communityId,
    required List<Map<String, dynamic>> rules,
  }) async {
    try {
      final response = await _apiClient.put(
        '/communities/$communityId/rules',
        data: {'rules': rules},
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ServerException(
          'Update community rules failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(
        'Failed to update community rules: ${e.toString()}',
      );
    }
  }
}
