import { View } from "react-native";

export default function boxComponent({ width, height, children, style }) {
  const boxStyles = [{ width, height }, style];

  return <View style={boxStyles}>{children}</View>;
}
