import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useAtomValue } from 'jotai';
import ImagePicker from 'react-native-image-crop-picker';

import { storeEditionState, userState } from '../../store/atoms';
import { addStorePhoto } from '../../api/stores';
import { getErrorMessage } from '../../utils/errorMessage';
import Menu from '../../components/Menu';

const AddPhoto = ({ navigation }) => {
  const { colors } = useTheme();
  const storeEdition = useAtomValue(storeEditionState);
  const user = useAtomValue(userState);
  const [state, setState] = useState({
    loading: false,
    error: null,
    image: null,
    caption: '',
    productId: '',
  });

  const selectImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 1920,
        height: 1920,
        cropping: true,
        cropperCircleOverlay: false,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        includeBase64: false,
      });

      // Adapter le format de l'image pour correspondre à notre état
      const fileName = image.path.split('/').pop() || 'photo.jpg';

      setState(prev => ({
        ...prev,
        image: {
          uri: image.path,
          type: image.mime,
          fileName: fileName,
          width: image.width,
          height: image.height,
        },
        error: null,
      }));
    } catch (error) {
      // L'utilisateur a annulé ou une erreur s'est produite
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Erreur', 'Impossible de sélectionner une image');
        console.error('Image picker error:', error);
      }
    }
  };

  const uploadPhoto = async () => {
    if (!state.image) {
      setState(prev => ({ ...prev, error: 'Veuillez sélectionner une image' }));
      return;
    }

    if (!state.caption.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Veuillez ajouter une légende',
      }));
      return;
    }

    if (!storeEdition.id) {
      setState(prev => ({
        ...prev,
        error: "Le bar doit être enregistré avant d'ajouter des photos",
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const formData = new FormData();

      // Préparer le fichier image pour FormData
      const imageFile = {
        uri:
          Platform.OS === 'android'
            ? state.image.uri
            : state.image.uri.replace('file://', ''),
        type: state.image.type || 'image/jpeg',
        name: state.image.fileName || 'photo.jpg',
      };

      formData.append('image', imageFile);
      formData.append('caption', state.caption.trim());

      if (state.productId) {
        formData.append('productId', state.productId);
      }

      const result = await addStorePhoto(storeEdition.id, formData, {
        jwt: user.jwt,
      });

      if (result.error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: getErrorMessage(result.error),
        }));
        return;
      }

      // Succès - retour à l'écran précédent
      Alert.alert('Photo ajoutée', 'Votre photo a été ajoutée avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Une erreur est survenue lors de l'envoi de la photo",
      }));
    }
  };

  const products = storeEdition.products || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="always">
        <View style={styles.scrollView}>
          <Card style={styles.card}>
            <Card.Title title="Image" />
            <Card.Content>
              {state.image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: state.image.uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <Button
                    mode="outlined"
                    onPress={selectImage}
                    style={styles.changeButton}>
                    Changer l&apos;image
                  </Button>
                </View>
              ) : (
                <View>
                  <Text style={styles.noImageText}>
                    Aucune image sélectionnée
                  </Text>
                  <Button
                    mode="contained"
                    onPress={selectImage}
                    style={styles.selectButton}
                    icon="camera">
                    Sélectionner une image
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Légende" />
            <Card.Content>
              <TextInput
                label="Légende"
                mode="outlined"
                multiline
                numberOfLines={3}
                value={state.caption}
                onChangeText={caption =>
                  setState(prev => ({ ...prev, caption }))
                }
                placeholder="Décrivez cette photo..."
                maxLength={280}
              />
              <Text style={styles.characterCount}>
                {state.caption.length}/280
              </Text>
            </Card.Content>
          </Card>

          {products.length > 0 && (
            <Card style={styles.card}>
              <Card.Title title="Produit associé (optionnel)" />
              <Card.Content>
                <Menu>
                  <Menu.Item
                    name={
                      state.productId
                        ? products.find(p => p.product === state.productId)
                            ?.name || 'Sélectionner un produit'
                        : 'Aucun produit'
                    }
                    icon="beer"
                    onPress={() => {
                      // Pour l'instant, on va utiliser un système simple
                      // On pourrait améliorer avec un sélecteur dédié
                    }}
                    last
                  />
                </Menu>
                <Text style={styles.helperText}>
                  Associez cette photo à une bière spécifique si applicable
                </Text>
              </Card.Content>
            </Card>
          )}

          {state.error && (
            <Card style={[styles.card, styles.errorCard]}>
              <Card.Content>
                <Text style={styles.errorText}>{state.error}</Text>
              </Card.Content>
            </Card>
          )}

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={uploadPhoto}
              disabled={state.loading || !state.image || !state.caption.trim()}
              style={styles.submitButton}>
              {state.loading ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                'Ajouter la photo'
              )}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeButton: {
    marginTop: 8,
  },
  noImageText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.6,
  },
  selectButton: {
    marginTop: 8,
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 4,
    opacity: 0.6,
    fontSize: 12,
  },
  helperText: {
    marginTop: 8,
    opacity: 0.6,
    fontSize: 12,
  },
  errorCard: {
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  submitButton: {
    paddingVertical: 8,
  },
});

export default AddPhoto;
