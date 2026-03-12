import React from "react";
import { StyleSheet, View, ActivityIndicator, Text, Modal } from "react-native";
import { useTranslation } from "react-i18next";

const LoadingModal = ({ modalVisible, setModalVisible }) => {
  const { t } = useTranslation();

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="small" color="#1B6878" />
            <Text style={{ marginTop: 10, fontSize: 12, color: "#fff" }}>
              {" "}
              {t("pleasewait")}{" "}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modal: {
    height: 30,
    alignSelf: "center",
  },
});

export default LoadingModal;
