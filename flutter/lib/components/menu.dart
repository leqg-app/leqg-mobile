import 'package:flutter/material.dart';

/// Port de src/components/Menu.js : liste d'items avec bordures fines.
class MenuList extends StatelessWidget {
  final List<MenuListItem> children;

  const MenuList({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(children: children);
  }
}

class MenuListItem extends StatelessWidget {
  final String name;
  final String? icon;
  final IconData? iconData;
  final VoidCallback? onPress;
  final bool last;
  final String? value;
  final bool arrow;

  const MenuListItem({
    super.key,
    required this.name,
    this.icon,
    this.iconData,
    this.onPress,
    this.last = false,
    this.value,
    this.arrow = false,
  });

  @override
  Widget build(BuildContext context) {
    const border = BorderSide(color: Color(0xFF777777), width: 0.5);
    return Container(
      decoration: BoxDecoration(
        border: Border(
          top: border,
          bottom: last ? border : BorderSide.none,
        ),
      ),
      child: ListTile(
        leading: iconData != null ? Icon(iconData) : null,
        title: Text(name),
        onTap: onPress ?? () {},
        trailing: (value != null || arrow)
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (value != null)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 15),
                      child: Text(value!),
                    ),
                  if (arrow) const Icon(Icons.chevron_right),
                ],
              )
            : null,
      ),
    );
  }
}
