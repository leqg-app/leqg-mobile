import React, { useEffect } from 'react';
import { Button, Dialog, Portal } from 'react-native-paper';
import Slider from '@react-native-community/slider';

function PriceFilter({ onClose, onPrice, initialPrice = 10 }) {
  const [price, setPrice] = React.useState(initialPrice);

  useEffect(() => {
    setPrice(initialPrice);
  }, [initialPrice]);

  const onSubmit = () => {
    onClose();
    onPrice(price);
  };

  return (
    <Portal>
      <Dialog visible onDismiss={onClose}>
        <Dialog.Title>Filtrer par prix: {price}€</Dialog.Title>
        <Dialog.Content>
          <Slider
            minimumValue={1}
            maximumValue={10}
            step={1}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#000000"
            onValueChange={value => setPrice(value)}
            value={price}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose}>Annuler</Button>
          <Button onPress={onSubmit}>Valider</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export default PriceFilter;
