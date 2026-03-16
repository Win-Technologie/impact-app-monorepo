import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Alert,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImagePickerModal from "../../components/ImagePickerModal";

export default function EditProfile() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("********");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryCode, setCountryCode] = useState("CA");
  const [country, setCountry] = useState("Canada");
  const [province, setProvince] = useState("Québec");
  const [selfie, setSelfie] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  // Dropdown states
  const [countryOpen, setCountryOpen] = useState(false);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [countries, setCountries] = useState([
    { label: "Canada", value: "Canada", icon: () => <Text>🇨🇦</Text> },
    { label: "USA", value: "USA", icon: () => <Text>🇺🇸</Text> },
  ]);

  // Province options based on country
  const getProvinceOptions = () => {
    switch (country) {
      case "Canada":
        return [
          { label: "Alberta", value: "Alberta" },
          { label: "Colombie-Britannique", value: "Colombie-Britannique" },
          { label: "Île-du-Prince-Édouard", value: "Île-du-Prince-Édouard" },
          { label: "Manitoba", value: "Manitoba" },
          { label: "Nouveau-Brunswick", value: "Nouveau-Brunswick" },
          { label: "Nouvelle-Écosse", value: "Nouvelle-Écosse" },
          { label: "Nunavut", value: "Nunavut" },
          { label: "Ontario", value: "Ontario" },
          { label: "Québec", value: "Québec" },
          { label: "Saskatchewan", value: "Saskatchewan" },
          { label: "Terre-Neuve-et-Labrador", value: "Terre-Neuve-et-Labrador" },
          { label: "Territoires du Nord-Ouest", value: "Territoires du Nord-Ouest" },
          { label: "Yukon", value: "Yukon" },
        ];
      case "USA":
        return [
          { label: "Alabama", value: "Alabama" },
          { label: "Alaska", value: "Alaska" },
          { label: "Arizona", value: "Arizona" },
          { label: "Arkansas", value: "Arkansas" },
          { label: "California", value: "California" },
          { label: "Colorado", value: "Colorado" },
          { label: "Connecticut", value: "Connecticut" },
          { label: "Delaware", value: "Delaware" },
          { label: "Florida", value: "Florida" },
          { label: "Georgia", value: "Georgia" },
          { label: "Hawaii", value: "Hawaii" },
          { label: "Idaho", value: "Idaho" },
          { label: "Illinois", value: "Illinois" },
          { label: "Indiana", value: "Indiana" },
          { label: "Iowa", value: "Iowa" },
          { label: "Kansas", value: "Kansas" },
          { label: "Kentucky", value: "Kentucky" },
          { label: "Louisiana", value: "Louisiana" },
          { label: "Maine", value: "Maine" },
          { label: "Maryland", value: "Maryland" },
          { label: "Massachusetts", value: "Massachusetts" },
          { label: "Michigan", value: "Michigan" },
          { label: "Minnesota", value: "Minnesota" },
          { label: "Mississippi", value: "Mississippi" },
          { label: "Missouri", value: "Missouri" },
          { label: "Montana", value: "Montana" },
          { label: "Nebraska", value: "Nebraska" },
          { label: "Nevada", value: "Nevada" },
          { label: "New Hampshire", value: "New Hampshire" },
          { label: "New Jersey", value: "New Jersey" },
          { label: "New Mexico", value: "New Mexico" },
          { label: "New York", value: "New York" },
          { label: "North Carolina", value: "North Carolina" },
          { label: "North Dakota", value: "North Dakota" },
          { label: "Ohio", value: "Ohio" },
          { label: "Oklahoma", value: "Oklahoma" },
          { label: "Oregon", value: "Oregon" },
          { label: "Pennsylvania", value: "Pennsylvania" },
          { label: "Rhode Island", value: "Rhode Island" },
          { label: "South Carolina", value: "South Carolina" },
          { label: "South Dakota", value: "South Dakota" },
          { label: "Tennessee", value: "Tennessee" },
          { label: "Texas", value: "Texas" },
          { label: "Utah", value: "Utah" },
          { label: "Vermont", value: "Vermont" },
          { label: "Virginia", value: "Virginia" },
          { label: "Washington", value: "Washington" },
          { label: "West Virginia", value: "West Virginia" },
          { label: "Wisconsin", value: "Wisconsin" },
          { label: "Wyoming", value: "Wyoming" },
        ];
      default:
        return [{ label: province || "Province", value: province || "Province" }];
    }
  };
  
  const [provinces, setProvinces] = useState(getProvinceOptions());

  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const HOST_URL = API_URL.replace("api/", "");

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    setProvinces(getProvinceOptions());
  }, [country]);

  const loadUserData = async () => {
    try {
      // Get user ID and token from AsyncStorage
      const userData = JSON.parse(await AsyncStorage.getItem("user"));
      const token = await AsyncStorage.getItem("userToken");
      
      if (userData && token) {
        const userId = userData.user._id;
        
        // Fetch fresh data from backend
        const response = await fetch(`${API_URL}users/user/profile/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          // Update AsyncStorage with fresh data
          userData.user = user;
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          
          // Update state with fresh data from MongoDB
          setName(user.name || "");
          setLastName(user.lastName || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
          setLicenseNumber(user.licenseNumber || "");
          setExpirationDate(user.expirationDate || "");
          setAddress(user.address || "");
          setCity(user.city || "");
          setPostalCode(user.postalCode || "");
          setCountry(user.country || "Canada");
          setCountryCode(user.countryCode || "CA");
          setProvince(user.province || "Québec");
        } else {
          // Fallback to AsyncStorage data if API fails
          setName(userData.user.name || "");
          setLastName(userData.user.lastName || "");
          setEmail(userData.user.email || "");
          setPhone(userData.user.phone || "");
          setLicenseNumber(userData.user.licenseNumber || "");
          setExpirationDate(userData.user.expirationDate || "");
          setAddress(userData.user.address || "");
          setCity(userData.user.city || "");
          setPostalCode(userData.user.postalCode || "");
          setCountry(userData.user.country || "Canada");
          setCountryCode(userData.user.countryCode || "CA");
          setProvince(userData.user.province || "Québec");
        }
      }
      
      const s = await AsyncStorage.getItem("selfie");
      setFilePath(s);
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  const handleSave = async () => {
    // Validate name
    if (!name || !name.trim()) {
      Alert.alert("Erreur", "Le prénom est requis");
      return;
    }
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(name)) {
      Alert.alert("Erreur", "Le prénom ne doit contenir que des lettres");
      return;
    }

    // Validate last name
    if (!lastName || !lastName.trim()) {
      Alert.alert("Erreur", "Le nom de famille est requis");
      return;
    }
    if (!nameRegex.test(lastName)) {
      Alert.alert("Erreur", "Le nom de famille ne doit contenir que des lettres");
      return;
    }

    // Validate email
    if (!email || !email.trim()) {
      Alert.alert("Erreur", "L'email est requis");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erreur", "Format d'email invalide");
      return;
    }

    // Validate phone
    if (!phone || !phone.trim()) {
      Alert.alert("Erreur", "Le numéro de téléphone est requis");
      return;
    }
    const phoneRegex = /^[0-9\s()+-]+$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Erreur", "Le numéro de téléphone ne doit contenir que des chiffres et symboles (+, -, (, ))");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      Alert.alert("Erreur", "Le numéro de téléphone doit contenir au moins 10 chiffres");
      return;
    }

    // Validate license number
    if (!licenseNumber || !licenseNumber.trim()) {
      Alert.alert("Erreur", "Le numéro de permis est requis");
      return;
    }

    // Validate expiration date
    if (!expirationDate || !expirationDate.trim()) {
      Alert.alert("Erreur", "La date d'expiration du permis est requise");
      return;
    }

    // Validate address
    if (!address || !address.trim()) {
      Alert.alert("Erreur", "L'adresse est requise");
      return;
    }

    // Validate city
    if (!city || !city.trim()) {
      Alert.alert("Erreur", "La ville est requise");
      return;
    }
    if (!nameRegex.test(city)) {
      Alert.alert("Erreur", "La ville ne doit contenir que des lettres");
      return;
    }

    // Validate postal code
    if (!postalCode || !postalCode.trim()) {
      Alert.alert("Erreur", "Le code postal est requis");
      return;
    }
    const postalCodeCanada = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;
    const postalCodeUS = /^\d{5}(-\d{4})?$/;
    if (country === "Canada" && !postalCodeCanada.test(postalCode)) {
      Alert.alert("Erreur", "Format de code postal canadien invalide (ex: H2X 1Y7)");
      return;
    }
    if (country === "USA" && !postalCodeUS.test(postalCode)) {
      Alert.alert("Erreur", "Format de code postal américain invalide (ex: 12345 ou 12345-6789)");
      return;
    }

    // Validate country and province
    if (!country) {
      Alert.alert("Erreur", "Le pays est requis");
      return;
    }
    if (!province) {
      Alert.alert("Erreur", "La province/état est requis(e)");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_URL}users/user`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          lastName,
          email,
          phone,
          licenseNumber,
          expirationDate,
          address,
          city,
          postalCode,
          country,
          countryCode,
          province,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const userData = JSON.parse(await AsyncStorage.getItem("user"));
        userData.user = { ...userData.user, name, lastName, email, phone, licenseNumber, expirationDate, address, city, postalCode, country, countryCode, province };
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        
        Alert.alert("Succès", "Votre profil a été mis à jour", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Erreur", data.msg || data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.log("Error saving profile:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder les modifications");
    }
  };

  const handlePasswordEditClick = () => {
    setShowPasswordConfirmModal(true);
  };

  const handlePasswordConfirm = () => {
    if (!oldPassword) {
      Alert.alert("Erreur", "Veuillez entrer votre mot de passe actuel");
      return;
    }
    setShowPasswordConfirmModal(false);
    setShowPasswordChangeModal(true);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmNewPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_URL}users/user/password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowPasswordChangeModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        Alert.alert("Succès", "Votre mot de passe a été modifié avec succès");
      } else {
        Alert.alert("Erreur", data.msg || "Une erreur est survenue");
      }
    } catch (error) {
      console.log("Error changing password:", error);
      Alert.alert("Erreur", "Impossible de modifier le mot de passe");
    }
  };

  const createFormData = (photo, body = {}) => {
    let filename = photo.fileName.split("/").pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : "image";

    const data = new FormData();
    data.append("image", {
      name: photo.fileName,
      type: type,
      uri: Platform.OS === "ios" ? photo.uri.replace("file://", "") : photo.uri,
    });

    Object.keys(body).forEach((key) => {
      data.append(key, body[key]);
    });

    return data;
  };

  const handleUploadPhoto = async (photo) => {
    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      console.error("No token provided");
      return;
    }

    fetch(`${API_URL}users/user/upload-profile-image`, {
      method: "PATCH",
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      body: createFormData(photo, { userId: "123" }),
    })
      .then((response) => response.json())
      .then((response) => {
        const newPath = `${HOST_URL}Backend/${response.imagePath}`;
        saveSelfie(newPath);
        setFilePath(newPath);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveSelfie = async (selfie) => {
    await AsyncStorage.setItem("selfie", selfie);
  };

  useEffect(() => {
    if (selfie && !visible) {
      handleUploadPhoto(selfie);
    }
  }, [visible]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollView}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Retour</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Header Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                filePath
                  ? { uri: filePath }
                  : require("../../assets/avatar.jpg")
              }
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setVisible(true)}
            >
              <MaterialIcons name="camera-alt" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{name} {lastName}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Prénom */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Steve"
              placeholderTextColor="#B0B0B0"
            />
          </View>

          {/* Nom */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Blanchard"
              placeholderTextColor="#B0B0B0"
            />
          </View>

          {/* Adresse courriel */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Adresse courriel</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFlex}
                value={email}
                onChangeText={setEmail}
                placeholder="example@hotmail.com"
                placeholderTextColor="#B0B0B0"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="edit" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Numéro de téléphone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFlex}
                value={phone}
                onChangeText={setPhone}
                placeholder="(514) 388-3900"
                placeholderTextColor="#B0B0B0"
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="edit" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mot de passe */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFlex}
                value={password}
                editable={false}
                placeholder="••••••••"
                placeholderTextColor="#B0B0B0"
                secureTextEntry
              />
              <TouchableOpacity style={styles.iconButton} onPress={handlePasswordEditClick}>
                <MaterialIcons name="edit" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Numéro de permis */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Numéro de permis</Text>
            <TextInput
              style={styles.input}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              placeholder="2023-000123-12"
              placeholderTextColor="#B0B0B0"
            />
          </View>

          {/* Date d'expiration */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Date d'expiration</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFlex}
                value={expirationDate}
                onChangeText={setExpirationDate}
                placeholder="08/2023"
                placeholderTextColor="#B0B0B0"
              />
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="edit" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Adresse complète */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Adresse complète</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFlex}
                value={address}
                onChangeText={setAddress}
                placeholder="1280 Sainte-Marie"
                placeholderTextColor="#B0B0B0"
              />
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="edit" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Ville et Code postal */}
          <View style={styles.rowFields}>
            <View style={styles.halfFieldContainer}>
              <TextInput
                style={styles.simpleInput}
                value={city}
                onChangeText={setCity}
                placeholder="Montréal"
                placeholderTextColor="#B0B0B0"
              />
            </View>
            <View style={styles.halfFieldContainer}>
              <TextInput
                style={styles.simpleInput}
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="J4K 1H8"
                placeholderTextColor="#B0B0B0"
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Pays et Province */}
          <View style={styles.rowFields}>
            <View style={[styles.halfFieldContainer, { zIndex: countryOpen ? 3000 : 1000 }]}>
              <DropDownPicker
                open={countryOpen}
                value={country}
                items={countries}
                setOpen={setCountryOpen}
                setValue={setCountry}
                setItems={setCountries}
                listMode="SCROLLVIEW"
                onChangeValue={(value) => {
                  if (value === "Canada") {
                    setCountryCode("CA");
                    setProvince("Québec");
                  } else if (value === "USA") {
                    setCountryCode("US");
                    setProvince("Alabama");
                  }
                  setProvinces(getProvinceOptions());
                }}
                placeholder="Sélectionnez un pays"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
              />
            </View>
            <View style={[styles.halfFieldContainer, { zIndex: provinceOpen ? 3000 : 1000 }]}>
              <DropDownPicker
                open={provinceOpen}
                value={province}
                items={provinces}
                setOpen={setProvinceOpen}
                setValue={setProvince}
                setItems={setProvinces}
                listMode="SCROLLVIEW"
                placeholder="Sélectionnez une province"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              Enregistrer mes modifications
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      <ImagePickerModal
        isVisible={visible}
        onClose={() => setVisible(false)}
        setImage={setSelfie}
      />

      {/* Confirm Password Modal */}
      <Modal
        visible={showPasswordConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmer le mot de passe</Text>
            <Text style={styles.modalSubtitle}>
              Pour votre sécurité, veuillez entrer votre ancien mot de passe.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Mot de passe"
              placeholderTextColor="#B0B0B0"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPasswordConfirmModal(false);
                  setOldPassword("");
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.continueModalButton]}
                onPress={handlePasswordConfirm}
              >
                <Text style={styles.continueButtonText}>Continuer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordChangeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordChangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier le mot de passe</Text>
            <Text style={styles.modalSubtitle}>
              Il doit contenir au moins 8 caractères et un chiffre ou symbole.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nouveau mot de passe"
              placeholderTextColor="#B0B0B0"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Confirmer le nouveau mot de passe"
              placeholderTextColor="#B0B0B0"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.modifyButton}
              onPress={handlePasswordChange}
            >
              <Text style={styles.modifyButtonText}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#19363C",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  profileSection: {
    backgroundColor: "#19363C",
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 30,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
   width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraButton: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#CF8C58",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#B0B0B0",
  },
  formSection: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: "#19363C",
    backgroundColor: "#FFFFFF",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  inputFlex: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#19363C",
  },
  iconButton: {
    padding: 12,
  },
  rowFields: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 10,
  },
  halfFieldContainer: {
    flex: 1,
  },
  simpleInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: "#19363C",
    backgroundColor: "#FFFFFF",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    height: 48,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    fontSize: 16,
    color: "#19363C",
  },
  saveButton: {
    backgroundColor: "#0B8BA8",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 25,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#19363C",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#19363C",
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#F1F1F1",
  },
  continueModalButton: {
    backgroundColor: "#0B8BA8",
  },
  cancelButtonText: {
    color: "#19363C",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modifyButton: {
    backgroundColor: "#0B8BA8",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  modifyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
