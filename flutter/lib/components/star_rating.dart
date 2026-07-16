import 'package:flutter/material.dart';

/// Équivalent de react-native-star-rating-widget : 5 étoiles, demi-étoiles en
/// affichage, sélection par touche quand [onChange] est fourni.
class StarRating extends StatelessWidget {
  final double rating;
  final void Function(int rating)? onChange;
  final double starSize;
  final Color? color;
  final Color emptyColor;

  const StarRating({
    super.key,
    required this.rating,
    this.onChange,
    this.starSize = 28,
    this.color,
    this.emptyColor = Colors.grey,
  });

  @override
  Widget build(BuildContext context) {
    final starColor = color ?? Theme.of(context).colorScheme.primary;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final position = index + 1;
        IconData icon;
        if (rating >= position) {
          icon = Icons.star;
        } else if (rating >= position - 0.5) {
          icon = Icons.star_half;
        } else {
          icon = Icons.star_border;
        }
        final star = Icon(
          icon,
          size: starSize,
          color: icon == Icons.star_border ? emptyColor : starColor,
        );
        if (onChange == null) {
          return star;
        }
        return GestureDetector(
          onTap: () => onChange!(position),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: star,
          ),
        );
      }),
    );
  }
}
