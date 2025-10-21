import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/community_remote_datasource.dart';
import '../../data/models/community_model.dart';
import '../../core/error/failures.dart';

/// Community list states
enum CommunityListStatus { initial, loading, success, error, loadingMore }

/// Community state class
class CommunityState {
  final List<CommunityModel> publicCommunities;
  final List<CommunityModel> myCommunities;
  final CommunityListStatus publicCommunitiesStatus;
  final CommunityListStatus myCommunitiesStatus;
  final String? errorMessage;
  final bool hasMorePublicCommunities;
  final bool hasMoreMyCommunities;
  final int currentPublicPage;
  final int currentMyPage;
  final CommunityModel? selectedCommunity;
  final bool isRefreshing;

  const CommunityState({
    this.publicCommunities = const [],
    this.myCommunities = const [],
    this.publicCommunitiesStatus = CommunityListStatus.initial,
    this.myCommunitiesStatus = CommunityListStatus.initial,
    this.errorMessage,
    this.hasMorePublicCommunities = true,
    this.hasMoreMyCommunities = true,
    this.currentPublicPage = 1,
    this.currentMyPage = 1,
    this.selectedCommunity,
    this.isRefreshing = false,
  });

  CommunityState copyWith({
    List<CommunityModel>? publicCommunities,
    List<CommunityModel>? myCommunities,
    CommunityListStatus? publicCommunitiesStatus,
    CommunityListStatus? myCommunitiesStatus,
    String? errorMessage,
    bool? hasMorePublicCommunities,
    bool? hasMoreMyCommunities,
    int? currentPublicPage,
    int? currentMyPage,
    CommunityModel? selectedCommunity,
    bool? isRefreshing,
  }) {
    return CommunityState(
      publicCommunities: publicCommunities ?? this.publicCommunities,
      myCommunities: myCommunities ?? this.myCommunities,
      publicCommunitiesStatus:
          publicCommunitiesStatus ?? this.publicCommunitiesStatus,
      myCommunitiesStatus: myCommunitiesStatus ?? this.myCommunitiesStatus,
      errorMessage: errorMessage,
      hasMorePublicCommunities:
          hasMorePublicCommunities ?? this.hasMorePublicCommunities,
      hasMoreMyCommunities: hasMoreMyCommunities ?? this.hasMoreMyCommunities,
      currentPublicPage: currentPublicPage ?? this.currentPublicPage,
      currentMyPage: currentMyPage ?? this.currentMyPage,
      selectedCommunity: selectedCommunity,
      isRefreshing: isRefreshing ?? this.isRefreshing,
    );
  }
}

/// Community provider dependencies
final communityRemoteDataSourceProvider = Provider<CommunityRemoteDataSource>((
  ref,
) {
  throw UnimplementedError(
    'CommunityRemoteDataSource provider must be overridden',
  );
});

/// Community notifier
class CommunityNotifier extends StateNotifier<CommunityState> {
  final CommunityRemoteDataSource _communityRemoteDataSource;
  static const int _pageSize = 20;

  CommunityNotifier({
    required CommunityRemoteDataSource communityRemoteDataSource,
  }) : _communityRemoteDataSource = communityRemoteDataSource,
       super(const CommunityState());

  /// Fetch public communities with pagination
  Future<void> fetchPublicCommunities({
    int page = 1,
    int limit = _pageSize,
    String? search,
    String? category,
    bool isRefresh = false,
  }) async {
    try {
      if (isRefresh) {
        state = state.copyWith(isRefreshing: true, currentPublicPage: 1);
      } else if (page == 1) {
        state = state.copyWith(
          publicCommunitiesStatus: CommunityListStatus.loading,
          errorMessage: null,
        );
      } else {
        state = state.copyWith(
          publicCommunitiesStatus: CommunityListStatus.loadingMore,
        );
      }

      final response = await _communityRemoteDataSource.getCommunitiesList(
        page: page,
        limit: limit,
        search: search,
        category: category,
        sortBy: 'member_count',
        sortOrder: 'desc',
      );

      final communitiesData = response['data'] as List<dynamic>? ?? [];
      final communities = communitiesData
          .map((json) => CommunityModel.fromJson(json as Map<String, dynamic>))
          .toList();

      final pagination = response['pagination'] as Map<String, dynamic>? ?? {};
      final hasMore = pagination['has_next'] as bool? ?? false;

      if (isRefresh || page == 1) {
        state = state.copyWith(
          publicCommunities: communities,
          publicCommunitiesStatus: CommunityListStatus.success,
          hasMorePublicCommunities: hasMore,
          currentPublicPage: page,
          isRefreshing: false,
        );
      } else {
        state = state.copyWith(
          publicCommunities: [...state.publicCommunities, ...communities],
          publicCommunitiesStatus: CommunityListStatus.success,
          hasMorePublicCommunities: hasMore,
          currentPublicPage: page,
        );
      }
    } catch (e) {
      state = state.copyWith(
        publicCommunitiesStatus: CommunityListStatus.error,
        errorMessage: _getErrorMessage(e),
        isRefreshing: false,
      );
    }
  }

  /// Fetch user's communities
  Future<void> fetchMyCommunities({
    int page = 1,
    int limit = _pageSize,
    bool isRefresh = false,
  }) async {
    try {
      if (isRefresh) {
        state = state.copyWith(isRefreshing: true, currentMyPage: 1);
      } else if (page == 1) {
        state = state.copyWith(
          myCommunitiesStatus: CommunityListStatus.loading,
          errorMessage: null,
        );
      } else {
        state = state.copyWith(
          myCommunitiesStatus: CommunityListStatus.loadingMore,
        );
      }

      // This would be a different endpoint that returns user's joined communities
      final response = await _communityRemoteDataSource.getCommunitiesList(
        page: page,
        limit: limit,
      );

      final communitiesData = response['data'] as List<dynamic>? ?? [];
      final communities = communitiesData
          .map((json) => CommunityModel.fromJson(json as Map<String, dynamic>))
          .where((community) => community.isMember)
          .toList();

      final pagination = response['pagination'] as Map<String, dynamic>? ?? {};
      final hasMore = pagination['has_next'] as bool? ?? false;

      if (isRefresh || page == 1) {
        state = state.copyWith(
          myCommunities: communities,
          myCommunitiesStatus: CommunityListStatus.success,
          hasMoreMyCommunities: hasMore,
          currentMyPage: page,
          isRefreshing: false,
        );
      } else {
        state = state.copyWith(
          myCommunities: [...state.myCommunities, ...communities],
          myCommunitiesStatus: CommunityListStatus.success,
          hasMoreMyCommunities: hasMore,
          currentMyPage: page,
        );
      }
    } catch (e) {
      state = state.copyWith(
        myCommunitiesStatus: CommunityListStatus.error,
        errorMessage: _getErrorMessage(e),
        isRefreshing: false,
      );
    }
  }

  /// Load more public communities
  Future<void> loadMorePublicCommunities({
    String? search,
    String? category,
  }) async {
    if (!state.hasMorePublicCommunities ||
        state.publicCommunitiesStatus == CommunityListStatus.loadingMore) {
      return;
    }

    await fetchPublicCommunities(
      page: state.currentPublicPage + 1,
      search: search,
      category: category,
    );
  }

  /// Load more user's communities
  Future<void> loadMoreMyCommunities() async {
    if (!state.hasMoreMyCommunities ||
        state.myCommunitiesStatus == CommunityListStatus.loadingMore) {
      return;
    }

    await fetchMyCommunities(page: state.currentMyPage + 1);
  }

  /// Refresh public communities (pull-to-refresh)
  Future<void> refreshPublicCommunities({
    String? search,
    String? category,
  }) async {
    await fetchPublicCommunities(
      page: 1,
      search: search,
      category: category,
      isRefresh: true,
    );
  }

  /// Refresh user's communities (pull-to-refresh)
  Future<void> refreshMyCommunities() async {
    await fetchMyCommunities(page: 1, isRefresh: true);
  }

  /// Create a new community
  Future<CommunityModel?> createCommunity({
    required String name,
    required String description,
    String? category,
    bool isPrivate = false,
  }) async {
    try {
      // Validate inputs
      if (name.trim().isEmpty) {
        throw Exception('Community name is required');
      }

      if (description.trim().isEmpty) {
        throw Exception('Community description is required');
      }

      if (name.length < 3) {
        throw Exception('Community name must be at least 3 characters long');
      }

      if (description.length < 10) {
        throw Exception(
          'Community description must be at least 10 characters long',
        );
      }

      final response = await _communityRemoteDataSource.createCommunity(
        name: name.trim(),
        description: description.trim(),
        category: category,
        isPrivate: isPrivate,
      );

      final community = CommunityModel.fromJson(response);

      // Add to my communities list optimistically
      state = state.copyWith(
        myCommunities: [community, ...state.myCommunities],
      );

      return community;
    } catch (e) {
      state = state.copyWith(errorMessage: _getErrorMessage(e));
      return null;
    }
  }

  /// Join a community
  Future<bool> joinCommunity(String communityId) async {
    try {
      await _communityRemoteDataSource.joinCommunity(communityId);

      // Update community in both lists optimistically
      _updateCommunityInLists(
        communityId: communityId,
        updater: (community) => community.copyWith(
          isMember: true,
          memberCount: community.memberCount + 1,
        ),
      );

      return true;
    } catch (e) {
      state = state.copyWith(errorMessage: _getErrorMessage(e));
      return false;
    }
  }

  /// Leave a community
  Future<bool> leaveCommunity(String communityId) async {
    try {
      await _communityRemoteDataSource.leaveCommunity(communityId);

      // Update community in both lists optimistically
      _updateCommunityInLists(
        communityId: communityId,
        updater: (community) => community.copyWith(
          isMember: false,
          memberCount: community.memberCount - 1,
        ),
      );

      // Remove from my communities list
      state = state.copyWith(
        myCommunities: state.myCommunities
            .where((community) => community.id != communityId)
            .toList(),
      );

      return true;
    } catch (e) {
      state = state.copyWith(errorMessage: _getErrorMessage(e));
      return false;
    }
  }

  /// Get community details
  Future<CommunityModel?> getCommunityDetails(String communityId) async {
    try {
      final response = await _communityRemoteDataSource.getCommunityDetails(
        communityId,
      );
      final community = CommunityModel.fromJson(response);

      // Update selected community
      state = state.copyWith(selectedCommunity: community);

      // Update community in lists if it exists
      _updateCommunityInLists(
        communityId: communityId,
        updater: (oldCommunity) => community,
      );

      return community;
    } catch (e) {
      state = state.copyWith(errorMessage: _getErrorMessage(e));
      return null;
    }
  }

  /// Clear selected community
  void clearSelectedCommunity() {
    if (state.selectedCommunity != null) {
      state = state.copyWith(selectedCommunity: null);
    }
  }

  /// Clear error message
  void clearError() {
    if (state.errorMessage != null) {
      state = state.copyWith(errorMessage: null);
    }
  }

  /// Private helper methods
  void _updateCommunityInLists({
    required String communityId,
    required CommunityModel Function(CommunityModel) updater,
  }) {
    // Update in public communities
    final updatedPublicCommunities = state.publicCommunities.map((community) {
      return community.id == communityId ? updater(community) : community;
    }).toList();

    // Update in my communities
    final updatedMyCommunities = state.myCommunities.map((community) {
      return community.id == communityId ? updater(community) : community;
    }).toList();

    state = state.copyWith(
      publicCommunities: updatedPublicCommunities,
      myCommunities: updatedMyCommunities,
    );
  }

  String _getErrorMessage(dynamic error) {
    if (error is ServerException) {
      return error.message;
    } else if (error is Exception) {
      return error.toString().replaceFirst('Exception: ', '');
    } else {
      return 'An unexpected error occurred';
    }
  }
}

/// Community provider
final communityProvider =
    StateNotifierProvider<CommunityNotifier, CommunityState>((ref) {
      final communityRemoteDataSource = ref.watch(
        communityRemoteDataSourceProvider,
      );

      return CommunityNotifier(
        communityRemoteDataSource: communityRemoteDataSource,
      );
    });

/// Convenience providers
final publicCommunitiesProvider = Provider<List<CommunityModel>>((ref) {
  return ref.watch(communityProvider).publicCommunities;
});

final myCommunitiesProvider = Provider<List<CommunityModel>>((ref) {
  return ref.watch(communityProvider).myCommunities;
});

final selectedCommunityProvider = Provider<CommunityModel?>((ref) {
  return ref.watch(communityProvider).selectedCommunity;
});
