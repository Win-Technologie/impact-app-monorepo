// Dans ListItem.js
import {  Animated, StyleSheet } from 'react-native';

const MainPageListItem = ({ item, slideAnim }) => (
  <>
    <Animated.Text
      style={[
        styles.title,
        { transform: [{ translateX: slideAnim }] },
      ]}
    >
      {item.title}
    </Animated.Text>
    <Animated.Text
      style={[
        styles.description,
        { transform: [{ translateX: slideAnim }] },
      ]}
    >
      {item.description}
    </Animated.Text>
  </>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  description: {
    fontSize: 16,
    textAlign: "left",
    marginBottom: 15,
    marginTop: 10,
    alignSelf: "flex-start",
  },
});

export default MainPageListItem;
