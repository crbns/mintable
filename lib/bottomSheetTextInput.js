import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { TextInput, findNodeHandle } from "react-native";
import { useBottomSheetInternal } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";

/**
 * Sheet-aware text input: reports focus/blur to the enclosing bottom sheet so
 * it can lift above the keyboard. Mirrors @gorhom/bottom-sheet's
 * BottomSheetTextInput, but renders react-native's TextInput instead of
 * react-native-gesture-handler's wrapper. NativeWind's interop drops the ref
 * of plain function components (RN 0.81's TextInput is one), so RNGH's
 * NativeViewGestureHandler never got a view and threw on mount.
 *
 * The inner TextInput opts out of the interop (`cssInterop={false}`) so the
 * ref survives; className is resolved by registering this wrapper instead.
 */
const SheetTextInput = forwardRef(
  ({ onFocus, onBlur, ...rest }, providedRef) => {
    const ref = useRef(null);
    const { animatedKeyboardState, textInputNodesRef } =
      useBottomSheetInternal();

    const handleOnFocus = useCallback(
      (args) => {
        animatedKeyboardState.set((state) => ({
          ...state,
          target: args.nativeEvent.target,
        }));
        onFocus?.(args);
      },
      [onFocus, animatedKeyboardState]
    );

    const handleOnBlur = useCallback(
      (args) => {
        const keyboardState = animatedKeyboardState.get();
        const currentFocusedInput = findNodeHandle(
          TextInput.State.currentlyFocusedInput()
        );

        // only clear the target if it is ours and focus didn't just move to
        // another input in the same sheet
        const shouldRemoveCurrentTarget =
          keyboardState.target === args.nativeEvent.target;
        const shouldIgnoreBlurEvent =
          currentFocusedInput &&
          textInputNodesRef.current.has(currentFocusedInput);

        if (shouldRemoveCurrentTarget && !shouldIgnoreBlurEvent) {
          animatedKeyboardState.set((state) => ({
            ...state,
            target: undefined,
          }));
        }

        onBlur?.(args);
      },
      [onBlur, animatedKeyboardState, textInputNodesRef]
    );

    useEffect(() => {
      const componentNode = findNodeHandle(ref.current);
      if (!componentNode) {
        return;
      }

      if (!textInputNodesRef.current.has(componentNode)) {
        textInputNodesRef.current.add(componentNode);
      }

      return () => {
        const componentNode = findNodeHandle(ref.current);
        if (!componentNode) {
          return;
        }

        // clear the keyboard target if it belongs to this input
        const keyboardState = animatedKeyboardState.get();
        if (keyboardState.target === componentNode) {
          animatedKeyboardState.set((state) => ({
            ...state,
            target: undefined,
          }));
        }

        if (textInputNodesRef.current.has(componentNode)) {
          textInputNodesRef.current.delete(componentNode);
        }
      };
    }, [textInputNodesRef, animatedKeyboardState]);

    useImperativeHandle(providedRef, () => ref.current ?? undefined, []);

    return (
      <TextInput
        cssInterop={false}
        ref={ref}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        {...rest}
      />
    );
  }
);

const BottomSheetTextInput = memo(SheetTextInput);
BottomSheetTextInput.displayName = "BottomSheetTextInput";

// same mapping NativeWind registers for react-native's TextInput
cssInterop(BottomSheetTextInput, {
  className: { target: "style", nativeStyleToProp: { textAlign: true } },
});

export default BottomSheetTextInput;
