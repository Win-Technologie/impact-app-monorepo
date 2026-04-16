import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSetRecoilState } from "recoil";
import { SelectedVehicleState } from "../../GlobalState/SelectedVehiclesState";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const setGlobalSelectedVehicleId = useSetRecoilState(SelectedVehicleState);
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const { t } = useTranslation();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token provided");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}vehicles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns {car, insurance} objects - extract car data only
        // Filter out invalid vehicles: must have _id AND valid brand/model (not empty strings)
        const validVehicles = (data.carsWithInsurances || [])
          .filter(item => {
            if (!item.car || !item.car._id) return false;
            const brand = item.car.brand?.trim();
            const model = item.car.model?.trim();
            // Must have at least brand OR model with actual content
            return (brand && brand.length > 0) || (model && model.length > 0);
          })
          .map(item => item.car); // Extract just the car object
        setVehicles(validVehicles);
        // Set first vehicle as selected by default
        if (validVehicles.length > 0) {
          setSelectedVehicleId(validVehicles[0]._id);
        }
      } else {
        console.error("Failed to fetch vehicles");
        setVehicles([]);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleDeleteVehicle = async (vehicleId, vehicleName) => {
    Alert.alert(
      t("vehicleList.deleteAlertTitle", { defaultValue: "Delete" }),
      t("vehicleList.deleteAlertMessageWithName", { name: vehicleName }),
      [
        { text: t("vehicleList.deleteAlertCancel", { defaultValue: "Cancel" }), style: "cancel" },
        {
          text: t("vehicleList.deleteAlertConfirm", { defaultValue: "Delete" }),
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              if (!token) {
                Alert.alert(t("common.error", { defaultValue: "Error" }), t("vehicleList.sessionExpired", { defaultValue: "Session expired" }));
                return;
              }

              const response = await fetch(`${API_URL}vehicles/delete/${vehicleId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                // Remove from local state
                const updatedVehicles = vehicles.filter(v => v._id !== vehicleId);
                setVehicles(updatedVehicles);
                // If deleted vehicle was selected, select first remaining vehicle
                if (selectedVehicleId === vehicleId && updatedVehicles.length > 0) {
                  setSelectedVehicleId(updatedVehicles[0]._id);
                } else if (updatedVehicles.length === 0) {
                  setSelectedVehicleId(null);
                }
              } else {
                Alert.alert(t("common.error", { defaultValue: "Error" }), t("vehicleList.removeFailed", { defaultValue: "Unable to remove the vehicle" }));
              }
            } catch (error) {
              console.error("Error deleting vehicle:", error);
              Alert.alert(t("common.error", { defaultValue: "Error" }), t("common.unknownError", { defaultValue: "An unknown error occurred" }));
            }
          },
        },
      ]
    );
  };

  const handleNavigateToVehicleInfo = (vehicleId) => {
    setGlobalSelectedVehicleId(vehicleId);
    router.push(`vehicleOptions/VehicleInfo?vehicleId=${vehicleId}`);
  };

  const handleNavigateToInsurance = (vehicleId) => {
    setGlobalSelectedVehicleId(vehicleId);
    router.push(`vehicleOptions/VehicleInsurance?vehicleId=${vehicleId}`);
  };

  const handleAddVehicle = () => {
    router.push("vehicleOptions/AddVehicle");
  };

  const renderVehicleCard = ({ item }) => {
    const isSelected = item._id === selectedVehicleId;
    const vehicleName = `${item.brand || ""} ${item.model || ""} ${item.year || ""}`.trim() || "Véhicule";

    return (
      <View style={styles.vehicleCard}>
        {/* Vehicle Header */}
        <View style={[styles.vehicleHeader, isSelected && styles.vehicleHeaderSelected]}>
          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={() => handleSelectVehicle(item._id)}
          >
            <Text style={[styles.vehicleName, isSelected && styles.vehicleNameSelected]}>
              {vehicleName}
            </Text>
          </TouchableOpacity>
          {isSelected ? (
            <View style={styles.selectedBadge}>
              <MaterialIcons name="check-circle" size={20} color="white" />
              <Text style={styles.selectedText}>{t("vehicleList.selected")}</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteVehicle(item._id, vehicleName)}
            >
              <Text style={styles.deleteText}>{t("vehicleList.remove")}</Text>
              <MaterialIcons name="delete-outline" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Vehicle Details Sections - CLICKABLE */}
        <TouchableOpacity
          style={styles.detailRow}
          onPress={() => handleNavigateToVehicleInfo(item._id)}
        >
          <View>
            <Text style={styles.detailTitle}>{t("vehicleList.vehicleInfo")}</Text>
            <Text style={styles.detailSubtitle}>
              {t("vehicleList.vehicleInfoSubtitle")}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.detailRow}
          onPress={() => handleNavigateToInsurance(item._id)}
        >
          <View>
            <Text style={styles.detailTitle}>{t("vehicleList.insuranceInfo")}</Text>
            <Text style={styles.detailSubtitle}>
              {t("vehicleList.insuranceInfoSubtitle")}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B8BA8" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={{ flexDirection: "row", alignItems: "center" }} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={20} color="#19363C" />
            <Text style={{ color: "#19363C", marginLeft: 8 }}>{t("common.back")}</Text>
        </TouchableOpacity>
        <View>
            <Text style={styles.headerTitle}>{t("vehicleList.title")}</Text>
        </View>
      </View>

        {vehicles.length > 0 && (
          <Text style={styles.sectionTitle}>{t("vehicleList.myVehicles")}</Text>
        )}

      <FlatList
        data={vehicles}
        renderItem={renderVehicleCard}
        keyExtractor={(item) => item._id || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="directions-car" size={64} color="#CCC" />
            <Text style={styles.emptyText}>{t("vehicleList.noVehicles")}</Text>
            <Text style={styles.emptySubtext}>
              {t("vehicleList.addFirstVehicle")}
            </Text>
          </View>
        }
      />

      {/* Add Vehicle Button */}
      <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddVehicle}>
          <Text style={styles.addButtonText}>{t("vehicleList.addVehicle")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#19363C",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#19363C",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  vehicleCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#E8E8E8",
  },
  vehicleHeaderSelected: {
    backgroundColor: "#CF8C58",
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#19363C",
    flex: 1,
  },
  vehicleNameSelected: {
    color: "white",
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  selectedText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  deleteText: {
    color: "#666",
    fontSize: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F5F5F5",
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#19363C",
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 12,
    color: "#999",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 15,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  addButton: {
    backgroundColor: "#0B8BA8",
    padding: 20,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default VehicleList;
