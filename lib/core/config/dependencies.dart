import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import '../config/app_config.dart';
import '../../data/datasources/local/local_storage_service.dart';
import '../../data/datasources/remote/api_service.dart';
import '../../data/datasources/remote/socket_service.dart';

// Storage providers
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );
});

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be initialized');
});

final localStorageServiceProvider = Provider<LocalStorageService>((ref) {
  return LocalStorageService(
    secureStorage: ref.read(secureStorageProvider),
    sharedPreferences: ref.read(sharedPreferencesProvider),
  );
});

// Network providers
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio();

  // Base options
  dio.options = BaseOptions(
    baseUrl: AppConfig.baseUrl,
    connectTimeout: const Duration(milliseconds: AppConfig.connectionTimeout),
    receiveTimeout: const Duration(milliseconds: AppConfig.receiveTimeout),
    sendTimeout: const Duration(milliseconds: AppConfig.sendTimeout),
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
  );

  // Add interceptors
  dio.interceptors.add(
    LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) {
        // Log to console in debug mode
        print(obj);
      },
    ),
  );

  // Add auth interceptor
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final localStorage = ref.read(localStorageServiceProvider);
        final token = await localStorage.getAuthToken();

        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }

        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Handle token refresh or logout
          final localStorage = ref.read(localStorageServiceProvider);
          await localStorage.clearAuthData();

          // Navigate to login screen
          // This would be handled by the auth state provider
        }

        handler.next(error);
      },
    ),
  );

  return dio;
});

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(ref.read(dioProvider));
});

// Socket provider
final socketProvider = Provider<IO.Socket>((ref) {
  final socket = IO.io(
    AppConfig.socketUrl,
    IO.OptionBuilder()
        .setTransports(['websocket'])
        .enableAutoConnect()
        .enableReconnection()
        .setReconnectionAttempts(AppConfig.maxRetries)
        .setReconnectionDelay(1000)
        .build(),
  );

  // Add authentication
  socket.onConnect((_) async {
    final localStorage = ref.read(localStorageServiceProvider);
    final token = await localStorage.getAuthToken();

    if (token != null) {
      socket.emit('authenticate', {'token': token});
    }
  });

  return socket;
});

final socketServiceProvider = Provider<SocketService>((ref) {
  return SocketService(ref.read(socketProvider));
});

// Initialize dependency injection
Future<ProviderContainer> initializeDependencies() async {
  final container = ProviderContainer();

  // Initialize SharedPreferences
  final sharedPreferences = await SharedPreferences.getInstance();
  container.read(
    sharedPreferencesProvider.overrideWith((ref) => sharedPreferences),
  );

  return container;
}
