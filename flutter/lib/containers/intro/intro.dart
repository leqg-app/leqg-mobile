import 'package:flutter/material.dart';

import '../../theme.dart';
import 'location_permission.dart';

/// Port de src/containers/Intro/Intro.js : 2 écrans de présentation
/// swipables (≙ react-native-intro-screens).
class IntroStack extends StatelessWidget {
  const IntroStack({super.key});

  @override
  Widget build(BuildContext context) {
    return Navigator(
      onGenerateRoute: (settings) => MaterialPageRoute(
        settings: settings,
        builder: (context) => const _IntroScreen(),
      ),
    );
  }
}

class _IntroPage {
  final String title;
  final String description;
  final IconData icon;

  const _IntroPage(
      {required this.title, required this.description, required this.icon});
}

const _pages = [
  _IntroPage(
    title: 'Trouvez votre bar !',
    description: 'Selon le prix, le lieu, la bière, les horaires...',
    icon: Icons.map,
  ),
  _IntroPage(
    title: 'Participez !',
    description: 'Ajoutez et modifiez les bars, aidez la communauté',
    icon: Icons.groups,
  ),
];

class _IntroScreen extends StatefulWidget {
  const _IntroScreen();

  @override
  State<_IntroScreen> createState() => _IntroScreenState();
}

class _IntroScreenState extends State<_IntroScreen> {
  final PageController _controller = PageController();
  int page = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _next() {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (context) => const LocationPermissionScreen(),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final primary = lightColorScheme.primary;
    final isLastPage = page == _pages.length - 1;

    return Scaffold(
      backgroundColor: primary,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView(
                controller: _controller,
                onPageChanged: (newPage) => setState(() => page = newPage),
                children: [
                  for (final introPage in _pages)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 40),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 100,
                            height: 100,
                            child:
                                Icon(introPage.icon, color: Colors.white, size: 70),
                          ),
                          const SizedBox(height: 30),
                          Text(
                            introPage.title,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 15),
                          Text(
                            introPage.description,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                color: Colors.white, fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: _next,
                    child: const Text('Passer',
                        style: TextStyle(color: Colors.white)),
                  ),
                  Row(
                    children: [
                      for (var i = 0; i < _pages.length; i++)
                        Container(
                          width: 8,
                          height: 8,
                          margin:
                              const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: i == page
                                ? Colors.white
                                : Colors.white.withValues(alpha: 0.4),
                          ),
                        ),
                    ],
                  ),
                  isLastPage
                      ? TextButton(
                          onPressed: _next,
                          child: const Text('OK',
                              style: TextStyle(color: Colors.white)),
                        )
                      : TextButton(
                          onPressed: () => _controller.nextPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeOut,
                          ),
                          child: const Icon(Icons.arrow_forward,
                              color: Colors.white),
                        ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
