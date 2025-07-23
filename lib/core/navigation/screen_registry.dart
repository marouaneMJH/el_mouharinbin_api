import 'package:no_fap/core/navigation/screen_definition.dart';
import 'package:no_fap/core/navigation/page_definition.dart';
import 'package:no_fap/ui/pages/main/badge_overview.dart';
import 'package:no_fap/ui/pages/main/chat_overview.dart';
import 'package:no_fap/ui/pages/main/community_overview.dart';
import 'package:no_fap/ui/pages/main/group_overview.dart';
import 'package:no_fap/ui/pages/main/history_overview.dart';
import 'package:no_fap/ui/pages/main/start_date_picker.dart';
import 'package:no_fap/ui/screens/main_screen.dart';
import 'package:no_fap/data/globals.dart' show mainScreenKey;

final List<ScreenDefinition> appScreensPages = [
  ScreenDefinition(
    screen: MainScreen(key: mainScreenKey),
    pages: [
      PageDefinition(title: "Home", index: 0, page: HomePage()),
      PageDefinition(title: "History", index: 1, page: HistoryPage()),
      PageDefinition(title: "Group", index: 2, page: GroupPage()),
      PageDefinition(title: "Community", index: 3, page: CommunityPage()),
      PageDefinition(title: "Chat", index: 4, page: ChatPage()),
      PageDefinition(title: "", index: 5, page: StartDatePicker()),
    ],
  ),
];
