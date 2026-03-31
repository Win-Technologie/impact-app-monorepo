import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRecoilState } from "recoil";
import { notificationsState } from "../../GlobalState/NotificationsState";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useRecoilState(notificationsState);

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAll = () => setNotifications([]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, item.read ? styles.read : styles.unread]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.itemText}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </View>
      <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notifications</Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clear}>Clear</Text>
        </TouchableOpacity>
      </View>

      {notifications && notifications.length > 0 ? (
        <FlatList
          data={notifications.sort((a, b) => b.createdAt - a.createdAt)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  header: { fontSize: 20, fontWeight: "bold" },
  clear: { color: "#CF8C58" },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee", flexDirection: "row", justifyContent: "space-between" },
  itemText: { flex: 1, paddingRight: 8 },
  title: { fontWeight: "bold", marginBottom: 4 },
  body: { color: "#555" },
  time: { color: "#999", fontSize: 11 },
  empty: { marginTop: 40, alignItems: "center" },
  emptyText: { color: "#999" },
  unread: { backgroundColor: "#fff8f2" },
  read: { backgroundColor: "white" },
});
