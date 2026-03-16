import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import TextInputLarge from "../../../components/SignUp/textInputLarge";
import AnimatedButton from "../../../components/SignUp/animatedButton";
import DualOptionButtonStep from "../../../components/SignUp/dualBottomButtonsSteps";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import Stepper from "../../../components/SignUp/stepper";
import { useRecoilState } from "recoil";
import { userDetailsState } from "../../../GlobalState/userDetailState";
import { userInfoGatherState } from "../../../GlobalState/userDetailState";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

const nameAndGender = ({ onNext }) => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [userDetails, setUserDetails] = useRecoilState(userDetailsState);
  const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
  const { t } = useTranslation();

  //console.log(userDetails);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: userDetails.name,
      lastName: userDetails.lastName,
      gender: userDetails.gender,
    },
    mode: "onChange",
  });

  const validateNameInput = (text) => {
    if (/\d/.test(text)) {
      return t("nameAndGenderScreen.nameCannotContainNumbers");
    }

    return true;
  };

  const handleSelectGender = (gender) => {
    setUserDetails({ ...userDetails, gender });
  };

  const handlePressback = () => {
    setCurrentStep(currentStep - 1);
    router.back();
  };

  const handlePressContinue = handleSubmit((data) => {
    setCurrentStep(currentStep + 1);

    if (progressData[0].actualstep == 0) {
      const array = progressData.map((item) => {
        if (item.id == 0) {
          return {
            id: 0,
            title: "Information personnelles",
            subtitle: "4 minutes",
            completion: 0,
            actualstep: 1,
            nbstep: 4,
          };
        } else {
          return item;
        }
      });

      setProgressData(array);
    }

    router.push("/signup/personalInfoSteps/dateOfBirth");
  });

  // GenderButton dans SignUpStep1.js
  const GenderButton = ({ title, gender, onPress }) => {
    const isSelected = userDetails.gender === gender;

    // Définition des styles en fonction de l'état isSelected
    const buttonStyle = isSelected
      ? {
          backgroundColor: "#0B8BA8",
          borderColor: "#0B8BA8",
          marginHorizontal: 5,
        }
      : {
          backgroundColor: "transparent",
          borderColor: "#ccc",
          marginHorizontal: 5,
        };

    const textStyle = {
      color: isSelected ? "white" : "#ccc",
    };

    return (
      <AnimatedButton
        onPress={() => {
          onPress(gender); // Mettre à jour react-hook-form
          handleSelectGender(gender); // Mettre à jour Recoil
        }}
        title={title}
        customStyle={buttonStyle}
        textStyle={textStyle}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stepper currentStep={1} totalSteps={totalSteps} displayStep={1} />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{t("nameAndGenderScreen.pageTitle")}</Text>

        <View style={styles.inputSection}>
          <Controller
            control={control}
            name="name"
            rules={{
              required: t("nameAndGenderScreen.firstNameRequired"),
              validate: validateNameInput,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInputLarge
                placeholder={t("nameAndGenderScreen.firstNamePlaceholder")}
                autoCorrect={false}
                autoCapitalize="words"
                keyboardType="default"
                onBlur={onBlur}
                onChangeText={(text) => {
                  onChange(text);
                  setUserDetails({ ...userDetails, name: text });
                }}
                value={value}
              />
            )}
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name.message}</Text>
          )}
        </View>

        <View style={styles.inputSection}>
          <Controller
            control={control}
            name="lastName"
            rules={{
              required: t("nameAndGenderScreen.lastNameRequired"),
              validate: validateNameInput,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInputLarge
                placeholder={t("nameAndGenderScreen.lastNamePlaceholder")}
                autoCorrect={false}
                autoCapitalize="words"
                keyboardType="default"
                onBlur={onBlur}
                onChangeText={(text) => {
                  onChange(text);
                  setUserDetails({ ...userDetails, lastName: text });
                }}
                value={value}
              />
            )}
          />
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName.message}</Text>
          )}
        </View>

        <Text style={styles.title}>
          {t("nameAndGenderScreen.genderQuestion")}
        </Text>
        <View style={styles.inputSection}>
          <Controller
            control={control}
            name="gender"
            rules={{ required: t("nameAndGenderScreen.genderRequired") }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.genderButtonContainer}>
                <View style={styles.inputSection}>
                  <GenderButton
                    title={t("nameAndGenderScreen.male")}
                    gender="M"
                    isSelected={value === "M"}
                    onPress={onChange}
                  />
                </View>
                <View style={styles.inputSection}>
                  <GenderButton
                    title={t("nameAndGenderScreen.female")}
                    gender="F"
                    isSelected={value === "F"}
                    onPress={onChange}
                  />
                </View>
                <View style={styles.inputSection}>
                  <GenderButton
                    title={t("nameAndGenderScreen.nonBinary")}
                    gender="non-binary"
                    isSelected={value === "non-binary"}
                    onPress={onChange}
                  />
                </View>
              </View>
            )}
          />
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender.message}</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.absoluteButtonContainer}>
        <DualOptionButtonStep
          onPressBack={handlePressback}
          onPressContinue={() => {
            handlePressContinue();
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: 20,
    paddingTop: 0,
    backgroundColor: "white",
  },

  content: {
    paddingTop: 20,
  },

  absoluteButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  question: {
    fontSize: 18,
    marginBottom: 10,
  },

  genderButtonContainer: {
    // marginBottom: 20,
    // justifyContent: "space-between",
  },

  errorText: {
    color: "red",
    fontSize: 12,
    paddingVertical: 3,
    paddingLeft: 5,
  },

  nextButton: {
    backgroundColor: "#0B8BA8",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },

  nextButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },

  inputSection: {
    marginVertical: 10,
  },

  textInput: {
    height: 51,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default nameAndGender;
