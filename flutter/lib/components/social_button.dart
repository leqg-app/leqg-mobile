import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Port de src/components/social/* : boutons « Continuer avec … ».
const _googleSvg = '''
<svg viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.886 12.261c0-.815-.073-1.6-.21-2.352h-10.83v4.448h6.189a5.29 5.29 0 0 1-2.295 3.471v2.886h3.717c2.174-2.002 3.429-4.95 3.429-8.453Z" fill="#4285F4"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12.846 23.5c3.105 0 5.708-1.03 7.61-2.786l-3.716-2.886c-1.03.69-2.347 1.098-3.894 1.098-2.995 0-5.53-2.023-6.435-4.741H2.57v2.98A11.496 11.496 0 0 0 12.846 23.5Z" fill="#34A853"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M6.411 14.185A6.913 6.913 0 0 1 6.051 12c0-.758.13-1.495.36-2.185v-2.98H2.57A11.496 11.496 0 0 0 1.346 12c0 1.856.444 3.612 1.223 5.165l3.842-2.98Z" fill="#FBBC05"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12.846 5.074c1.688 0 3.204.58 4.396 1.72l3.299-3.299C18.549 1.64 15.946.5 12.846.5A11.496 11.496 0 0 0 2.569 6.835l3.842 2.98c.904-2.718 3.44-4.741 6.435-4.741Z" fill="#EA4335"/>
</svg>
''';

const _appleSvg = '''
<svg viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill="#000" d="M.846 0h24v24h-24z"/>
  <path d="M22.127 18.424c-.348.803-.76 1.543-1.237 2.223-.65.927-1.183 1.569-1.593 1.925-.636.585-1.317.885-2.047.902-.524 0-1.156-.15-1.891-.452-.738-.3-1.416-.45-2.036-.45-.65 0-1.348.15-2.094.45-.747.303-1.348.46-1.808.476-.7.03-1.398-.278-2.094-.926-.444-.387-1-1.052-1.666-1.993-.714-1.005-1.302-2.17-1.762-3.5-.493-1.435-.74-2.825-.74-4.17 0-1.542.333-2.871 1-3.985a5.867 5.867 0 0 1 2.095-2.12 5.635 5.635 0 0 1 2.832-.798c.556 0 1.285.172 2.19.51.904.339 1.484.51 1.738.51.19 0 .835-.2 1.927-.601 1.033-.372 1.904-.526 2.618-.465 1.935.156 3.39.919 4.356 2.293-1.73 1.049-2.587 2.517-2.57 4.401.016 1.468.548 2.69 1.595 3.659.474.45 1.003.798 1.593 1.045-.128.37-.263.725-.406 1.066ZM17.689.96c0 1.15-.42 2.224-1.258 3.218-1.011 1.182-2.234 1.865-3.56 1.757a3.58 3.58 0 0 1-.026-.435c0-1.105.48-2.287 1.334-3.253.426-.489.968-.896 1.626-1.22C16.46.707 17.08.53 17.665.5c.017.154.024.308.024.46Z" fill="#fff"/>
</svg>
''';

class SocialButton extends StatelessWidget {
  final String provider; // 'Google' ou 'Apple'
  final VoidCallback onPress;
  final bool loading;

  const SocialButton({
    super.key,
    required this.provider,
    required this.onPress,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    final isApple = provider == 'Apple';
    return Material(
      color: isApple ? Colors.black : const Color(0xFFFAFAFA),
      borderRadius: BorderRadius.circular(13),
      child: InkWell(
        borderRadius: BorderRadius.circular(13),
        onTap: onPress,
        child: Container(
          padding: const EdgeInsets.all(13),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFDDDDDD), width: 2),
            borderRadius: BorderRadius.circular(13),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SvgPicture.string(isApple ? _appleSvg : _googleSvg,
                  width: 20, height: 19),
              const SizedBox(width: 10),
              Text(
                'Continuer avec $provider',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: isApple ? Colors.white : Colors.black,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
