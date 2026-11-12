import { Keyboard, Pressable, StyleSheet } from "react-native";
import { BottomSheetBackdrop, useBottomSheet } from "@gorhom/bottom-sheet";

// BottomSheetBackdrop drops its tap gesture entirely with pressBehavior="none",
// so input sheets catch the tap with their own layer: the first tap only puts
// the keyboard away (a half-typed form isn't thrown out), the next one closes.
const KeyboardFirstPress = () => {
  const { close } = useBottomSheet();

  return (
    <Pressable
      style={StyleSheet.absoluteFill}
      accessibilityRole="button"
      accessibilityLabel="Bottom sheet backdrop"
      accessibilityHint="Closes the keyboard, then the bottom sheet"
      onPress={() => (Keyboard.isVisible() ? Keyboard.dismiss() : close())}
    />
  );
};

// Shared backdrop for Modal / DrawerModal: shown at the first detent, tap
// closes the sheet (keyboard first when `withInput`).
const SheetBackdrop = ({ withInput, ...props }) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    pressBehavior={withInput ? "none" : "close"}
    // the Pressable is the accessible element when it handles the tap
    accessible={!withInput}
  >
    {withInput && <KeyboardFirstPress />}
  </BottomSheetBackdrop>
);

export default SheetBackdrop;
