import 'package:no_fap/core/navigation/screen_definition.dart';
import 'package:no_fap/core/navigation/page_definition.dart';
import 'package:no_fap/ui/pages/main/badge_overview.dart';
import 'package:no_fap/ui/pages/main/chat_overview.dart';
import 'package:no_fap/ui/pages/main/community_overview.dart';
import 'package:no_fap/ui/pages/main/group_overview.dart';
import 'package:no_fap/ui/pages/main/history_overview.dart';
import 'package:no_fap/ui/screens/main_screen.dart';

final List<ScreenDefinition> appScreensPages = [
  ScreenDefinition(
    screen: const MainScreen(),
    pages: [
      PageDefinition(
        title: "Home",
        index: 0,
        page: HomePage(startDate: DateTime.now()),
      ),
      const PageDefinition(title: "History", index: 1, page: HistoryPage()),
      PageDefinition(title: "Group", index: 2, page: GroupPage()),
      PageDefinition(title: "Community", index: 3, page: CommunityPage()),
      PageDefinition(title: "Chat", index: 4, page: ChatPage()),
    ],
  ),
];
