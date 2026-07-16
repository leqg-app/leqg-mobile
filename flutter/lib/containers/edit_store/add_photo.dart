import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../api/stores.dart' as stores_api;
import '../../store/atoms.dart';
import '../../utils/error_message.dart';

/// Port de src/containers/EditStore/AddPhoto.js.
class AddPhotoScreen extends ConsumerStatefulWidget {
  const AddPhotoScreen({super.key});

  @override
  ConsumerState<AddPhotoScreen> createState() => _AddPhotoScreenState();
}

class _AddPhotoScreenState extends ConsumerState<AddPhotoScreen> {
  bool loading = false;
  String? error;
  XFile? image;
  String caption = '';

  Future<void> _selectImage() async {
    try {
      final picked = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 80,
      );
      if (picked != null) {
        setState(() {
          image = picked;
          error = null;
        });
      }
    } catch (_) {
      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Erreur'),
            content: const Text('Impossible de sélectionner une image'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    }
  }

  Future<void> _uploadPhoto() async {
    final storeEdition = ref.read(storeEditionProvider);
    final user = ref.read(userProvider);

    if (image == null) {
      setState(() => error = 'Veuillez sélectionner une image');
      return;
    }
    if (caption.trim().isEmpty) {
      setState(() => error = 'Veuillez ajouter une légende');
      return;
    }
    if (storeEdition.id == null) {
      setState(() =>
          error = "Le bar doit être enregistré avant d'ajouter des photos");
      return;
    }

    setState(() {
      loading = true;
      error = null;
    });

    try {
      await stores_api.addStorePhoto(
        storeEdition.id!,
        imagePath: image!.path,
        fields: {'caption': caption.trim()},
        jwt: user!.jwt,
      );

      if (mounted) {
        await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Photo ajoutée'),
            content: const Text('Votre photo a été ajoutée avec succès'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('OK'),
              ),
            ],
          ),
        );
        if (mounted) {
          Navigator.of(context).pop();
        }
      }
    } catch (err) {
      setState(() {
        loading = false;
        error = getErrorMessage(err);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ajouter une photo')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Image', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 16),
                  if (image != null) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.file(
                        File(image!.path),
                        width: double.infinity,
                        height: 300,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: OutlinedButton(
                        onPressed: _selectImage,
                        child: const Text("Changer l'image"),
                      ),
                    ),
                  ] else ...[
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.only(bottom: 16),
                        child: Text('Aucune image sélectionnée',
                            style: TextStyle(color: Colors.grey)),
                      ),
                    ),
                    FilledButton.icon(
                      onPressed: _selectImage,
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Sélectionner une image'),
                    ),
                  ],
                ],
              ),
            ),
          ),
          Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Légende',
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 16),
                  TextField(
                    maxLines: 3,
                    maxLength: 280,
                    onChanged: (value) => setState(() => caption = value),
                    decoration: const InputDecoration(
                      labelText: 'Légende',
                      hintText: 'Décrivez cette photo...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (error != null)
            Card(
              margin: const EdgeInsets.only(bottom: 16),
              color: const Color(0xFFFFEBEE),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(error!,
                    style: const TextStyle(color: Color(0xFFC62828))),
              ),
            ),
          Padding(
            padding: const EdgeInsets.only(top: 8, bottom: 32),
            child: FilledButton(
              onPressed:
                  (loading || image == null || caption.trim().isEmpty)
                      ? null
                      : _uploadPhoto,
              child: loading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Ajouter la photo'),
            ),
          ),
        ],
      ),
    );
  }
}
