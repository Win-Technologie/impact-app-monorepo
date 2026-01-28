import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InputsShowGroup from '../../components/Utils/Inputs/InputsShowGroup';
import { useRecoilValue } from 'recoil';
import { SelectedVehicleState } from '../../GlobalState/SelectedVehiclesState';
import { UserInfoState } from '../../GlobalState/UserInfoState';
import { VehicleUserInfoState } from '../../GlobalState/VehicleUserInfoState';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';

const VehicleInfo = () => {

    const { t } = useTranslation();
    const router = useRouter();
    const selectedVehicleId = useRecoilValue(SelectedVehicleState);
    const vehicleDetails = useRecoilValue(VehicleUserInfoState);
    const ownerDetails = useRecoilValue(UserInfoState);


    console.log(ownerDetails)

    if (!vehicleDetails || !ownerDetails) {
        return <Text>Loading...</Text>;
    }

    const vehicleInfo = [
        { style: 'column', label: t('vehicleInfo.brand'), value: ownerDetails.vehicle.brand || 'N/A' },
        { style: 'column', label: t('vehicleInfo.model'), value: ownerDetails.vehicle.model || 'N/A' },
        { style: 'column', label: t('vehicleInfo.year'), value: ownerDetails.vehicle.year ? ownerDetails.vehicle.year.toString() : 'N/A' },
        { style: 'column', label: t('vehicleInfo.color'), value: ownerDetails.vehicle.color || 'N/A' },
        { style: 'column', label: t('vehicleInfo.plate'), value: ownerDetails.vehicle.plate || 'N/A' },
        { style: 'column', label: t('vehicleInfo.serialNumber'), value: ownerDetails.vehicle.serialNumber || 'N/A' },
    ];

    const ownerInfo = [
        { style: 'column', label: t('vehicleInfo.ownerFirstName'), value: ownerDetails.owner.name || 'N/A' },
        { style: 'column', label: t('vehicleInfo.ownerLastName'), value: ownerDetails.owner.lastName || 'N/A' },
        { style: 'column', label: t('vehicleInfo.ownerPhone'), value: ownerDetails.owner.phone || 'N/A' },
        { style: 'column', label: t('vehicleInfo.ownerAddress'), value: ownerDetails.owner.address || 'N/A' },
        { style: 'row', firstLabel: t('vehicleInfo.ownerCity'), valueFirstLabel: ownerDetails.owner.city || 'N/A', secondLabel: t('vehicleInfo.ownerPostalCode'), valueSecondLabel: ownerDetails.owner.postalCode || 'N/A' },
        { style: 'row', firstLabel: t('vehicleInfo.ownerCountry'), valueFirstLabel: ownerDetails.owner.country || 'N/A', secondLabel: t('vehicleInfo.ownerProvince'), valueSecondLabel: ownerDetails.owner.province || 'N/A' }
      ];

    return (
        <SafeAreaView style={styles.container}>

            

            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 20, alignItems: "center" }}>
                <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => { router.back() }}>
                    <AntDesign name='arrowleft' size={20} color="#19363C" style={{ fontWeight: "200" }} /><Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
                </TouchableOpacity>

                <View>
                    <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>{t('vehicleList.title')}</Text>
                </View>
            </View>

            
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>{t('vehicleInfo.title')}</Text>
                <InputsShowGroup dataToShow={vehicleInfo} editable={false} />
                <Text style={styles.sectionTitle}>{t('vehicleInfo.ownerInfo')}</Text>
                <InputsShowGroup dataToShow={ownerInfo} editable={false} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 23,
        padding: 20,
        backgroundColor: "#FFFFFF",
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 35,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'right',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30, // Add bottom padding to ensure the last item is visible
    },
});

export default VehicleInfo;
