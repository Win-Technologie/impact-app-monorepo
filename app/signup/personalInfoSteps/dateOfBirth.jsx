import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useRecoilState } from 'recoil';
import { userDetailsState } from '../../../GlobalState/userDetailState';
import Stepper from '../../../components/SignUp/stepper';
import DualOptionButtonStep from '../../../components/SignUp/dualBottomButtonsSteps';
import { userInfoGatherState } from "../../../GlobalState/userDetailState";
import { DatePickerInput } from 'react-native-paper-dates';
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Dob() {

    const [currentStep, setCurrentStep] = useState(2);
    const totalSteps = 4;
    const [userDetails, setUserDetails] = useRecoilState(userDetailsState);
    const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
    const [date, setDate] = useState(undefined);
    const [inputDate, setInputDate] = React.useState(undefined);
    const {t} = useTranslation();


    const handleDateChange = (date) => {
        setUserDetails(prevDetails => ({ ...prevDetails, birthDay: date }));
    };

    const handleInputChange = (field, value) => {
        setUserDetails((prev) => ({ ...prev, [field]: value }));
    };


    const handlePressBack = () => {
        setCurrentStep(currentStep - 1);
        router.back();
    };

    dateArray = userDetails.birthDay.split('-');

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            date: userDetails.birthDay,
        },
        mode: "onChange",
    });

    function formatDate(val) {

        if (Number(val) > 9) {
            return val
        } else {
            return '0' + val;
        }
    }

  

    const handlePressContinue = handleSubmit((data) => {

        //console.log(data.date);
        //let birthDate = data.date.getFullYear() + '-' + formatDate(data.date.getMonth()+1) + '-' + formatDate(data.date.getDate());

        //console.log(birthDate);

        if (progressData[0].actualstep == 1) {

            const array = progressData.map((item) => {

                if (item.id == 0) {

                    return { id: 0, title: "Information personnelles", subtitle: "4 minutes", completion: 0, actualstep: 2, nbstep: 4 };

                } else {

                    return item
                }

            });

            setProgressData(array);
        }

        setCurrentStep(currentStep + 1);
        //setUserDetails({ ...userDetails, birthDay: birthDate });
        router.push("/signup/personalInfoSteps/phoneAndAddress");

    });



    return (
        <SafeAreaView style={styles.container}>

            <Stepper currentStep={progressData[0].actualstep} totalSteps={totalSteps} />

            <View style={styles.content}>

                <Text style={styles.title}>{t('dobScreen.title')}</Text>

                <View style={styles.inputSection}>

                    <Controller
                        control={control}
                        name='date'
                        rules={{
                            required: t('dobScreen.dateOfBirthRequired'),
                            pattern: {
                                value: /^\d{4}-\d{2}-\d{2}$/,
                                message: t('dobScreen.dateFormatError'),
                            },

                        }}
                        render={({ field: { onChange, onBlur, value } }) => (

                            <DatePickerInput
                                locale="en"
                                underlineColor="transparent"
                                mode="outlined"
                                activeOutlineColor="gray"
                                style={styles.input}
                                date={date}
                                /*onChangeText={(text) => {
                                    onChange(text);
                                    setDate(text);
                                  //  console.log(text)
                                }}*/
                                onChange={(d) => {
                                    //console.log(d);
                                    onChange(d)
                                    handleInputChange("birthDay", d.toISOString().split('T')[0]);
                                    //setInputDate(d);
                                }}
                                value={value ? new Date(value) : null}
                                inputMode="start"
                                //value={inputDate}
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
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: 20,
    paddingTop:0
  },

  content: {
    paddingTop:20
  },


    title: {
        fontSize: 23,
        marginVertical: 15,
        marginBottom: 5,
        fontWeight: "bold"
    },



    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },

   

    input: {
        backgroundColor: '#ffff',
    },

    errorText: {
        color: "red",
        fontSize: 12,
        paddingVertical: 30,
        paddingLeft: 5
    },

    inputSection: {
        marginVertical: 30,
        marginTop: 40
    },

});
