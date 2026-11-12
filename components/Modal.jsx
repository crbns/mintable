import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";
import {
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SheetBackdrop from "./SheetBackdrop";

// gorhom renders footerComponent as a component type, so a new callback per
// render would remount the whole footer (dropping in-flight presses). The
// callback stays stable and the latest footer node reaches it through this store.
const createFooterStore = (initial) => {
  let node = initial;
  const listeners = new Set();
  return {
    get: () => node,
    set: (next) => {
      node = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

const FooterContent = ({ store }) =>
  useSyncExternalStore(store.subscribe, store.get);

// Prop-driven bottom sheet. Sizes to its content unless `snapPoints` are
// passed. `scrollable` scrolls
// content taller than the screen, and `footer` pins content (e.g. the CTA)
// to the bottom edge, above the keyboard.
const Modal = ({
  isOpen,
  withInput,
  children,
  onRequestClose,
  snapPoints,
  // with explicit snapPoints, dynamic sizing would add a content-height detent
  enableDynamicSizing = !snapPoints,
  scrollable,
  footer,
  ...rest
}) => {
  const modalRef = useRef(null);
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props) => <SheetBackdrop {...props} withInput={withInput} />,
    [withInput]
  );

  const [footerStore] = useState(() => createFooterStore(footer));
  useLayoutEffect(() => {
    footerStore.set(footer);
  }, [footer, footerStore]);

  const renderFooter = useCallback(
    (props) => (
      <BottomSheetFooter {...props} bottomInset={insets.bottom}>
        <FooterContent store={footerStore} />
      </BottomSheetFooter>
    ),
    [footerStore, insets.bottom]
  );

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [isOpen]);

  // the footer sits insets.bottom above the edge, so this one inset plus the
  // measured footer height (enableFooterMarginAdjustment) clears both
  const contentStyle = { paddingHorizontal: 12, paddingBottom: insets.bottom };

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: "#0d2b45" }}
      handleIndicatorStyle={{ backgroundColor: "#7b7b8b" }}
      onDismiss={onRequestClose}
      backdropComponent={renderBackdrop}
      footerComponent={footer ? renderFooter : undefined}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustPan"
      enableBlurKeyboardOnGesture={!!withInput}
      enableDynamicSizing={enableDynamicSizing}
      topInset={insets.top}
      {...rest}
    >
      {scrollable ? (
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={contentStyle}
          enableFooterMarginAdjustment={!!footer}
        >
          {children}
        </BottomSheetScrollView>
      ) : (
        // flex-1 would stop a dynamic sheet from measuring its content
        <BottomSheetView
          className={enableDynamicSizing ? undefined : "flex-1"}
          style={contentStyle}
          enableFooterMarginAdjustment={!!footer}
        >
          {children}
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
};

export default Modal;
