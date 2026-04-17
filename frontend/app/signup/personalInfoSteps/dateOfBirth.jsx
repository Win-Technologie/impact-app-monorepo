import React from "react";
import { View, Text, StyleSheet, Keyboard } from "react-native";
import { router } from "expo-router";
import { useRecoilState } from "recoil";
import { userDetailsState } from "../../../GlobalState/userDetailState";
import Stepper from "../../../components/SignUp/stepper";
import DualOptionButtonStep from "../../../components/SignUp/dualBottomButtonsSteps";
import { userInfoGatherState } from "../../../GlobalState/userDetailState";
import { DatePickerInput } from "react-native-paper-dates";
import { Controller, useForm } from "react-hook-form";
import { TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { randomDateOfBirth } from "../../../utils/testData";

export default function Dob() {
  const totalSteps = 4;
  const [userDetails, setUserDetails] = useRecoilState(userDetailsState);
  const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
  const { t } = useTranslation();
  const today = new Date();

  const handleInputChange = (field, value) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handlePressBack = () => {
    router.back();
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: userDetails.birthDay,
    },
    mode: "onChange",
  });

  const handlePressContinue = handleSubmit(() => {
    if (progressData[0].actualstep == 1) {
      const array = progressData.map((item) => {
        if (item.id == 0) {
          return {
            id: 0,
            title: "Information personnelles",
            subtitle: "4 minutes",
            completion: 0,
            actualstep: 2,
            nbstep: 4,
          };
        } else {
          return item;
        }
      });

      setProgressData(array);
    }

    router.push("/signup/personalInfoSteps/phoneAndAddress");
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stepper currentStep={2} totalSteps={totalSteps} displayStep={2} />

      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => {
            const d = randomDateOfBirth();
            setValue("date", d, { shouldValidate: true });
            handleInputChange("birthDay", d.toISOString().split("T")[0]);
          }}
          style={{ backgroundColor: "#f0ad4e", padding: 8, borderRadius: 5, marginBottom: 10, alignSelf: "flex-start" }}
        >
          <Text style={{ fontSize: 12, color: "#333" }}>🧪 Fill test data</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t("dobScreen.title")}</Text>

        <View style={styles.inputSection}>
          <Controller
            control={control}
            name="date"
            rules={{
              required: t("dobScreen.dateOfBirthRequired"),
              validate: (value) => {
                if (!value) {
                  return t("dobScreen.dateOfBirthRequired");
                }

                const selectedDate = value instanceof Date ? value : new Date(value);

                if (Number.isNaN(selectedDate.getTime())) {
                  return t("dobScreen.dateFormatError");
                }

                if (selectedDate > today) {
                  return t("dobScreen.futureDateError");
                }

                return true;
              },
            }}
            render={({ field: { onChange, value } }) => (
              <DatePickerInput
                locale="en"
                underlineColor="transparent"
                mode="outlined"
                activeOutlineColor="gray"
                style={styles.input}
                keyboardType="default"
                validRange={{ endDate: today }}
                onChange={(d) => {
                  if (!d) {
                    return;
                  }

                  onChange(d);
                  handleInputChange("birthDay", d.toISOString().split("T")[0]);
                  Keyboard.dismiss();
                }}
                onFocus={() => Keyboard.dismiss()}
                value={value ? new Date(value) : null}
                inputMode="start"
              />
            )}
          />
          {errors.date && (
            <Text style={styles.errorText}>{errors.date.message}</Text>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <DualOptionButtonStep
          onPressBack={handlePressBack}
          onPressContinue={handlePressContinue}
        />
      </View>
    </SafeAreaView>
  );
}

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

  title: {
    fontSize: 23,
    marginVertical: 15,
    marginBottom: 5,
    fontWeight: "bold",
  },

  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  input: {
    backgroundColor: "#fff",
    height: 51,
    fontSize: 16,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    paddingVertical: 30,
    paddingLeft: 5,
  },

  inputSection: {
    marginVertical: 30,
    marginTop: 40,
  },
});
