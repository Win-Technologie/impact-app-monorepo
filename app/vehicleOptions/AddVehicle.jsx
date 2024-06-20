import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from "react-hook-form";
import { useRecoilState } from "recoil";
import { addVehicleFormState } from "../../GlobalState/AddVehicleFormState";
import { SelectedVehicleState } from "../../GlobalState/SelectedVehiclesState";
import { router } from 'expo-router';
import { DatePickerInput } from "react-native-paper-dates";
import SelectDropdown from "react-native-select-dropdown";
import SingleBottomButton from "../../components/SignUp/SingleBottomButton";
import { useTranslation } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from "react-native-vector-icons/MaterialIcons";
import { AntDesign } from '@expo/vector-icons';




const AddVehicle = () => {
  
  const [isOwner, setIsOwner] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useRecoilState(SelectedVehicleState);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const { t } = useTranslation();
  const [formState, setFormState] = useRecoilState(addVehicleFormState);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: formState,
    mode: "onChange",
  });

  const countries = [
    { label: "🇨🇦 Canada", value: "CA" },
    { label: "🇫🇷 France", value: "FR" },
    { label: "🇺🇸 États-Unis", value: "US" },
  ];

  const countryProvinces = {
    CA: ["Ontario", "Québec", "Colombie-Britannique"],
    FR: ["Île-de-France", "Nouvelle-Aquitaine", "Occitanie"],
    US: ["Californie", "Texas", "New York"],
  };

  const [country, setCountry] = useState(formState.vehicleOwnerCountry || "CA");
  const [province, setProvince] = useState(
    formState.vehicleOwnerProvince || ""
  );

  const onSelectCountry = (selectedItem, index) => {
    const selectedCountry = countries[index].value;
    setCountry(selectedCountry);
    handleInputChange("vehicleOwnerCountry", selectedCountry);
    const initialProvince = countryProvinces[selectedCountry]?.[0] || "";
    setProvince(initialProvince);
    handleInputChange("vehicleOwnerProvince", initialProvince);
  };

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const createVehicleDetails = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      console.error("No token provided");
      return false; // Indicate failure
    }

    try {
      const formattedDetails = {
        brand: formState.vehicleBrand,
        model: formState.vehicleModel,
        year: formState.vehicleYear,
        color: formState.vehicleColor,
        plate: formState.vehiclePlateNumber,
        serialNumber: formState.vehicleSerialNumber,
        immatriculation: {
          numeroCertificatImmatriculation: formState.vehicleNumeroCertificat,
          dateDelivrance: formState.vehicleCerticateDeliveryDate,
          dateExpiration: formState.vehicleCerticateExpirationDate,
          numeroEssieux: formState.vehiclenumeroEssieux,
          masseNette: formState.vehicleNetWeight,
          cylindree: formState.vehicleCylinder,
          numeroDossier: formState.vehicleDossierNumber,
          categorieUsage: formState.vehiclecategorieUsage,
        },
      };

      console.log(formattedDetails);
      

      const response = await fetch(`${API_URL}vehicles/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedDetails),
      });

      if (!response.ok) {
        throw new Error(`Failed to create vehicle: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data)
      setSelectedVehicleId(data.car._id); // Store the vehicle ID in Recoil state
      console.log(selectedVehicleId);

      return true; // Indicate success
    } catch (error) {
      console.error("Error creating vehicle details:", error);
      Alert.alert(t("common.error"), error.message || t("common.unknownError"));
      return false; // Indicate failure
    }
  };

  useEffect(() => {
    setProvince(countryProvinces[country]?.[0] || "");
  }, [country]);

  const handlePressContinue = handleSubmit(async (data) => {
    console.log(data);
    setFormState({ ...formState, ...data });
    const success = await createVehicleDetails();
    if (success) {
      router.push("vehicleOptions/AddInsurance");
    }
  });

  const handlePressBack = () => {
    router.back();
  };

    return (
        <SafeAreaView style={styles.container}>


            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 20,  alignItems: "center" }}>
                <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => { router.back() }}>
                    <AntDesign name='arrowleft' size={20} color="#19363C" style={{ fontWeight: "200" }} /><Text style={{ color: "#19363C" }}>{"   "}{t("common.back")}</Text>
                </TouchableOpacity>

                <View>
                    <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>{t("addVehicle.title")}</Text>
                </View>
            </View>


            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                  contentContainerStyle={styles.contentContainer}
                >

                    <Text style={styles.sectionTitle}>
                        {t("addVehicle.vehicleInformation")}
                    </Text>

                    <View style={styles.inputSection}>
                        <Controller
                            control={control}
                            name="vehicleBrand"
                            rules={{ required: t("addVehicle.vehicleBrand") }}
                            render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                placeholder={t("addVehicle.vehicleBrand")}
                                style={styles.textInput}
                                onBlur={onBlur}
                                onChangeText={(value) => {
                                onChange(value);
                                handleInputChange("vehicleBrand", value); // Ensure formState updates
                                }}
                                value={value}
                            />
                            )}
                        />
                        {errors.vehicleBrand && (
                            <Text style={styles.errorText}>{errors.vehicleBrand.message}</Text>
                        )}
                    <View style={styles.row}>
                        <View style={styles.inputHalf}>
                        <Controller
                            control={control}
                            name="vehicleModel"
                            rules={{ required: t("addVehicle.vehicleModelRequired") }}
                            render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                placeholder={t("addVehicle.vehicleModel")}
                                style={styles.textInput}
                                onBlur={onBlur}
                                onChangeText={(value) => {
                                onChange(value);
                                handleInputChange("vehicleModel", value); // Ensure formState updates
                                }}
                                value={value}
                            />
                            )}
                        />
                        {errors.vehicleModel && (
                            <Text style={styles.errorText}>
                            {errors.vehicleModel.message}
                            </Text>
                        )}
                        </View>
                        <View style={styles.inputHalf}>
                        <Controller
                            control={control}
                            name="vehicleYear"
                            rules={{
                            required: t("addVehicle.vehicleYearRequired"),
                            pattern: {
                                value: /^[0-9]{4}$/,
                                message: t("addVehicle.vehicleYearInvalid"),
                            },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                placeholder={t("addVehicle.vehicleYear")}
                                style={styles.textInput}
                                onBlur={onBlur}
                                onChangeText={(value) => {
                                onChange(value);
                                handleInputChange("vehicleYear", value); // Ensure formState updates
                                }}
                                value={value}
                                keyboardType="numeric"
                            />
                            )}
                        />
                        {errors.vehicleYear && (
                            <Text style={styles.errorText}>
                            {errors.vehicleYear.message}
                            </Text>
                        )}
                        </View>
                    </View>

            <Controller
              control={control}
              name="vehicleColor"
              rules={{ required: t("addVehicle.vehicleColorRequired") }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder={t("addVehicle.vehicleColor")}
                  style={styles.textInput}
                  onBlur={onBlur}
                  onChangeText={(value) => {
                    onChange(value);
                    handleInputChange("vehicleColor", value); // Ensure formState updates
                  }}
                  value={value}
                />
              )}
            />
            {errors.vehicleColor && (
              <Text style={styles.errorText}>{errors.vehicleColor.message}</Text>
            )}

            <Controller
              control={control}
              name="vehiclePlateNumber"
              rules={{
                required: t("addVehicle.vehiclePlateNumberRequired"),
                minLength: {
                  value: 7,
                  message: t("addVehicle.vehiclePlateNumberLength"),
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder={t("addVehicle.vehiclePlateNumber")}
                  style={styles.textInput}
                  onBlur={onBlur}
                  onChangeText={(value) => {
                    onChange(value);
                    handleInputChange("vehiclePlateNumber", value); // Ensure formState updates
                  }}
                  value={value}
                  maxLength={7}
                />
              )}
            />
            {errors.vehiclePlateNumber && (
              <Text style={styles.errorText}>
                {errors.vehiclePlateNumber.message}
              </Text>
            )}

            <Controller
              control={control}
              name="vehicleSerialNumber"
              rules={{
                required: t("addVehicle.vehicleSerialNumberRequired"),
                minLength: {
                  value: 13,
                  message: t("addVehicle.vehicleSerialNumberLength"),
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder={t("addVehicle.vehicleSerialNumber")}
                  style={styles.textInput}
                  onBlur={onBlur}
                  onChangeText={(value) => {
                    onChange(value);
                    handleInputChange("vehicleSerialNumber", value); // Ensure formState updates
                  }}
                  value={value}
                  maxLength={13}
                />
              )}
            />
            {errors.vehicleSerialNumber && (
              <Text style={styles.errorText}>
                {errors.vehicleSerialNumber.message}
              </Text>
            )}

            <Controller
              control={control}
              name="vehicleDossierNumber"
              rules={{ required: t("addVehicle.vehicleDossierNumberRequired") }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder={t("addVehicle.vehicleDossierNumber")}
                  style={styles.textInput}
                  onBlur={onBlur}
                  onChangeText={(value) => {
                    onChange(value);
                    handleInputChange("vehicleDossierNumber", value); // Ensure formState updates
                  }}
                  value={value}
                />
              )}
            />
            {errors.vehicleDossierNumber && (
              <Text style={styles.errorText}>
                {errors.vehicleDossierNumber.message}
              </Text>
            )}

            <Controller
              control={control}
              name="vehiclecategorieUsage"
              rules={{
                required: t("addVehicle.vehiclecategorieUsageRequired"),
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder={t("addVehicle.vehiclecategorieUsage")}
                  style={styles.textInput}
                  onBlur={onBlur}
                  onChangeText={(value) => {
                    onChange(value);
                    handleInputChange("vehiclecategorieUsage", value); // Ensure formState updates
                  }}
                  value={value}
                />
              )}
            />
            {errors.vehiclecategorieUsage && (
              <Text style={styles.errorText}>
                {errors.vehiclecategorieUsage.message}
              </Text>
            )}

            <Controller
              control={control}
              name="vehiclenumeroEssieux"
              rules={{ required: t("addVehicle.vehiclenumeroEssieuxRequired") }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder={t("addVehicle.vehiclenumeroEssieux")}
                  style={styles.textInput}
                  onBlur={onBlur}
                  onChangeText={(value) => {
                    onChange(value);
                    handleInputChange("vehiclenumeroEssieux", value); // Ensure formState updates
                  }}
                  value={value}
                />
              )}
            />
            {errors.vehiclenumeroEssieux && (
              <Text style={styles.errorText}>
                {errors.vehiclenumeroEssieux.message}
              </Text>
            )}

            <Controller
              control={control}
              name="vehicleNetWeight"
              rules={{ required: t("addVehicle.vehicleNetWeightRequired") }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder={t("addVehicle.vehicleNetWeight")}
                  style={styles.textInput}
                  onBlur={onBlur}
                  onChangeText={(value) => {
                    onChange(value);
                    handleInputChange("vehicleNetWeight", value); // Ensure formState updates
                  }}
                  value={value}
                />
              )}
            />
            {errors.vehicleNetWeight && (
              <Text style={styles.errorText}>
                {errors.vehicleNetWeight.message}
              </Text>
            )}

            <Controller
              control={control}
              name="vehicleCylinder"
              rules={{ required: t("addVehicle.vehicleCylinderRequired") }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder={t("addVehicle.vehicleCylinder")}
                  style={styles.textInput}
                  onBlur={onBlur}
                  onChangeText={(value) => {
                    onChange(value);
                    handleInputChange("vehicleCylinder", value); // Ensure formState updates
                  }}
                  value={value}
                />
              )}
            />
            {errors.vehicleCylinder && (
              <Text style={styles.errorText}>
                {errors.vehicleCylinder.message}
              </Text>
            )}

            <Controller
              control={control}
              name="vehicleNumeroCertificat"
              rules={{
                required: t("addVehicle.vehicleNumeroCertificatRequired"),
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder={t("addVehicle.vehicleNumeroCertificat")}
                  style={styles.textInput}
                  onBlur={onBlur}
                  onChangeText={(value) => {
                    onChange(value);
                    handleInputChange("vehicleNumeroCertificat", value); // Ensure formState updates
                  }}
                  value={value}
                />
              )}
            />
            {errors.vehicleNumeroCertificat && (
              <Text style={styles.errorText}>
                {errors.vehicleNumeroCertificat.message}
              </Text>
            )}

            <Controller
              control={control}
              name="vehicleCerticateDeliveryDate"
              render={({ field: { onChange, value } }) => (
                <DatePickerInput
                  locale="en"
                  underlineColor="transparent"
                  mode="outlined"
                  activeOutlineColor="gray"
                  style={[
                    { marginBottom: 10 },
                    { height: 51 },
                    { backgroundColor: "#FAFAFA" },
                  ]}
                  date={value ? new Date(value) : new Date()}
                  onChange={(date) => {
                    const formattedDate = date.toISOString().split("T")[0];
                    onChange(formattedDate);
                    handleInputChange("vehicleCerticateDeliveryDate", formattedDate); // Ensure formState updates
                  }}
                  inputMode="start"
                  value={value ? new Date(value) : new Date()}
                />
              )}
            />
            {errors.vehicleCerticateDeliveryDate && (
              <Text style={styles.errorText}>
                {errors.vehicleCerticateDeliveryDate.message}
              </Text>
            )}

            <Controller
              control={control}
              name="vehicleCerticateExpirationDate"
              render={({ field: { onChange, value } }) => (
                <DatePickerInput
                  locale="en"
                  underlineColor="transparent"
                  mode="outlined"
                  activeOutlineColor="gray"
                  style={[
                    { marginBottom: 10 },
                    { height: 51 },
                    { backgroundColor: "#FAFAFA" },
                  ]}
                  date={value ? new Date(value) : new Date()}
                  onChange={(date) => {
                    const formattedDate = date.toISOString().split("T")[0];
                    onChange(formattedDate);
                    handleInputChange("vehicleCerticateExpirationDate", formattedDate); // Ensure formState updates
                  }}
                  inputMode="start"
                  value={value ? new Date(value) : new Date()}
                  minimumDate={new Date()}
                />
              )}
            />
            {errors.vehicleCerticateExpirationDate && (
              <Text style={styles.errorText}>
                {errors.vehicleCerticateExpirationDate.message}
              </Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>{t("addVehicle.vehicleOwner")}</Text>
          <TouchableOpacity
            style={isOwner ? styles.ownerButtonSelected : styles.ownerButton}
            onPress={() => setIsOwner(true)}
          >
            <Text
              style={
                isOwner
                  ? styles.ownerButtonTextSelected
                  : styles.ownerButtonText
              }
            >
              {t("addVehicle.ownerYes")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={!isOwner ? styles.ownerButtonSelected : styles.ownerButton}
            onPress={() => setIsOwner(false)}
          >
            <Text
              style={
                !isOwner
                  ? styles.ownerButtonTextSelected
                  : styles.ownerButtonText
              }
            >
              {t("addVehicle.ownerNo")}
            </Text>
          </TouchableOpacity>

          {!isOwner && (
            <>
              <Controller
                control={control}
                name="vehicleOwnerFirstname"
                rules={{
                  required: t("addVehicle.vehicleOwnerFirstnameRequired"),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={t("addVehicle.vehicleOwnerFirstname")}
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(value) => {
                      onChange(value);
                      handleInputChange("vehicleOwnerFirstname", value); // Ensure formState updates
                    }}
                    value={value}
                  />
                )}
              />
              {errors.vehicleOwnerFirstname && (
                <Text style={styles.errorText}>
                  {errors.vehicleOwnerFirstname.message}
                </Text>
              )}

              <Controller
                control={control}
                name="vehicleOwnerName"
                rules={{ required: t("addVehicle.vehicleOwnerNameRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={t("addVehicle.vehicleOwnerName")}
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(value) => {
                      onChange(value);
                      handleInputChange("vehicleOwnerName", value); // Ensure formState updates
                    }}
                    value={value}
                  />
                )}
              />
              {errors.vehicleOwnerName && (
                <Text style={styles.errorText}>
                  {errors.vehicleOwnerName.message}
                </Text>
              )}

              <Controller
                control={control}
                name="vehicleOwnerPhone"
                rules={{ required: t("addVehicle.vehicleOwnerPhoneRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={t("addVehicle.vehicleOwnerPhone")}
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(value) => {
                      onChange(value);
                      handleInputChange("vehicleOwnerPhone", value); // Ensure formState updates
                    }}
                    value={value}
                    keyboardType="phone-pad"
                  />
                )}
              />
              {errors.vehicleOwnerPhone && (
                <Text style={styles.errorText}>
                  {errors.vehicleOwnerPhone.message}
                </Text>
              )}

              <Controller
                control={control}
                name="vehicleOwnerAddress"
                rules={{
                  required: t("addVehicle.vehicleOwnerAddressRequired"),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={t("addVehicle.vehicleOwnerAddress")}
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(value) => {
                      onChange(value);
                      handleInputChange("vehicleOwnerAddress", value); // Ensure formState updates
                    }}
                    value={value}
                  />
                )}
              />
              {errors.vehicleOwnerAddress && (
                <Text style={styles.errorText}>
                  {errors.vehicleOwnerAddress.message}
                </Text>
              )}

              <Controller
                control={control}
                name="vehicleOwnerCity"
                rules={{ required: t("addVehicle.vehicleOwnerCityRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={t("addVehicle.vehicleOwnerCity")}
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(value) => {
                      onChange(value);
                      handleInputChange("vehicleOwnerCity", value); // Ensure formState updates
                    }}
                    value={value}
                  />
                )}
              />
              {errors.vehicleOwnerCity && (
                <Text style={styles.errorText}>
                  {errors.vehicleOwnerCity.message}
                </Text>
              )}

              <Controller
                control={control}
                name="vehicleOwnerPostalCode"
                rules={{
                  required: t("addVehicle.vehicleOwnerPostalCodeRequired"),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={t("addVehicle.vehicleOwnerPostalCode")}
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(value) => {
                      onChange(value);
                      handleInputChange("vehicleOwnerPostalCode", value); // Ensure formState updates
                    }}
                    value={value}
                  />
                )}
              />
              {errors.vehicleOwnerPostalCode && (
                <Text style={styles.errorText}>
                  {errors.vehicleOwnerPostalCode.message}
                </Text>
              )}

              <View style={styles.row}>
                <View style={styles.inputHalf}>
                  <Text style={styles.pickerLabel}>{t("addVehicle.country")}</Text>
                  <Controller
                    control={control}
                    name="vehicleOwnerCountry"
                    render={({ field: { onChange, value } }) => (
                      <SelectDropdown
                        defaultButtonText={t("addVehicle.country")}
                        defaultValueByIndex={countries.findIndex(
                          (c) => c.value === value
                        )}
                        data={countries.map((country) => country.label)}
                        onSelect={(selectedItem, index) => {
                          onChange(countries[index].value);
                          handleInputChange(
                            "vehicleOwnerCountry",
                            countries[index].value
                          );
                        }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                          return selectedItem;
                        }}
                        rowTextForSelection={(item, index) => {
                          return item;
                        }}
                        buttonStyle={styles.dropdown1BtnStyle}
                        buttonTextStyle={styles.dropdown1BtnTxtStyle}
                        renderDropdownIcon={() => {
                          return <Text>▼</Text>;
                        }}
                        dropdownIconPosition={"right"}
                        dropdownStyle={styles.dropdown1DropdownStyle}
                        rowTextStyle={styles.dropdown1RowTxtStyle}
                      />
                    )}
                  />
                </View>

                <View style={styles.inputHalf}>
                  <Text style={styles.pickerLabel}>{t("addVehicle.province")}</Text>
                  <Controller
                    control={control}
                    name="vehicleOwnerProvince"
                    render={({ field: { onChange, value } }) => (
                      <SelectDropdown
                        defaultButtonText={t("addVehicle.province")}
                        defaultValueByIndex={(
                          countryProvinces[formState.vehicleOwnerCountry] || []
                        ).findIndex((p) => p === value)}
                        data={
                          countryProvinces[formState.vehicleOwnerCountry] || []
                        }
                        onSelect={(selectedItem, index) => {
                          onChange(selectedItem);
                          handleInputChange("vehicleOwnerProvince", selectedItem);
                        }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                          return selectedItem;
                        }}
                        rowTextForSelection={(item, index) => {
                          return item;
                        }}
                        buttonStyle={styles.dropdown2BtnStyle}
                        buttonTextStyle={styles.dropdown1BtnTxtStyle}
                        renderDropdownIcon={() => {
                          return <Text>▼</Text>;
                        }}
                        dropdownIconPosition={"right"}
                        dropdownStyle={styles.dropdown1DropdownStyle}
                        rowTextStyle={styles.dropdown1RowTxtStyle}
                      />
                    )}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.absoluteButtonContainer}>
          <TouchableOpacity style={styles.registerButton}>
             <Text style={styles.registerButtonText}>{t("common.save")}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#fff",
        //padding: 20
    },

    contentContainer: {
        padding: 20,
        paddingBottom: 80,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 35,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },

    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
    },


    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        flex: 1,
        textAlign: "right", // Align the title to the right
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
    },

  inputSection: {
    marginBottom: 20,
  },
  textInput: {
    height: 51,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  ownerButton: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    height: 51,
    justifyContent: "center",
  },
  ownerButtonSelected: {
    backgroundColor: "#1B6878",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    height: 51,
    justifyContent: "center",
  },
  ownerButtonText: {
    color: "#000",
    textAlign: "center",
  },
  ownerButtonTextSelected: {
    color: "#fff",
    textAlign: "center",
  },
  pickerContainer: {
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 51,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  
 
  datePickerInput: {
    height: 51,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 10,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  inputHalf: {
    width: "48%",
  },
  dropdown1BtnStyle: {
    width: "100%",
    height: 51,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 0,
  },
  dropdown2BtnStyle: {
    width: "100%",
    height: 51,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 0,
  },
  dropdown1BtnTxtStyle: {
    color: "#444",
    textAlign: "left",
    fontSize: 16,
  },
  dropdown1DropdownStyle: {
    backgroundColor: "#EFEFEF",
  },
  dropdown1RowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },
  dropdown1RowTxtStyle: {
    color: "#444",
    textAlign: "left",
  },

  absoluteButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  registerButton: {
    backgroundColor: "#1B6878",
    padding: 15,
    //borderRadius: 5,
    alignItems: "center",
  },

   registerButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

});

export default AddVehicle;
