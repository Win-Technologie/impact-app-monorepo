import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage to get the token
import { SelectedVehicleState } from '../../GlobalState/SelectedVehiclesState';
import { UserInfoState } from '../../GlobalState/UserInfoState';
import { VehicleUserInfoState } from '../../GlobalState/VehicleUserInfoState';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';


const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useRecoilState(SelectedVehicleState);
  const [vehicleDetails, setVehicleDetails] = useRecoilState(VehicleUserInfoState);
  const [userDetails, setUserDetails] = useRecoilState(UserInfoState);
  const router = useRouter();
  const { t } = useTranslation();
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const fetchUserDataAndVehicles = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('No token provided');
                return;
            }


            // Fetch vehicle information
            console.log('Fetching vehicle information...');
            const vehicleResponse = await fetch(`${API_URL}vehicles`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // const errorData1 = await vehicleResponse.json();

            // console.log(errorData1);

            if (!vehicleResponse.ok) {
                const errorData = await vehicleResponse.json();
                console.error('Vehicle response error:', errorData);
                throw new Error('Network response for vehicles was not ok');
            }

            const vehicleData = await vehicleResponse.json();
            console.log('Fetched vehicles:', vehicleData);

            setVehicles(vehicleData.carsWithInsurances); // Ensure to set the array of cars correctly

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    fetchUserDataAndVehicles();
  }, []);

  const handleSelect = async (id) => {
    const updatedVehicles = vehicles.map((vehicle) =>
      vehicle._id === id
        ? { ...vehicle, selected: true }
        : { ...vehicle, selected: false }
    );
    setVehicles(updatedVehicles);
    setSelectedVehicleId(id); // Set the selected vehicle ID

    // Fetch selected vehicle details
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('No token provided');
        return;
      }

      // Fetch vehicle details
      const vehicleResponse = await fetch(`${API_URL}vehicles/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!vehicleResponse.ok) {
        throw new Error('Network response for vehicle details was not ok');
      }

      const vehicleData = await vehicleResponse.json();
      console.log('Fetched vehicle details:', vehicleData); // Log the fetched vehicle details
      setVehicleDetails(vehicleData);

      // Fetch user information related to the vehicle
      const userResponse = await fetch(`${API_URL}users/user/vehicle/info/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Network response for user information was not ok');
      }

      const userData = await userResponse.json();
      console.log('Fetched user details:', userData);
      setUserDetails(userData);

    } catch (error) {
      console.error('Error fetching vehicle or user details:', error);
    }
  };

    const handleDelete = async (car) => {

        console.log(car);
    Alert.alert(
      t('vehicleList.deleteAlertTitle'),
      t('vehicleList.deleteAlertMessage'),
      [
        {
          text: t('vehicleList.deleteAlertCancel'),
          style: 'cancel',
        },
        {
          text: t('vehicleList.deleteAlertConfirm'),
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (!token) {
                console.error('No token provided');
                return;
              }

              const response = await fetch(`${API_URL}vehicles/delete/${car._id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error('Delete response error:', errorData);
                throw new Error('Network response was not ok');
              }

              fetchUserDataAndVehicles()
              

            } catch (error) {
              console.error('Error deleting vehicle:', error);
            }
          },
        },
      ]
    );
  };

    const handleAddVehicle = () => {
    router.push('./AddVehicle'); // Adjust this path based on your routing structure
    };



    const renderVehicle = ({ item }) => {

        const handleVehicleInfo = (car) => {

            handleSelect(car.car._id);
            router.push(`vehicleOptions/VehicleInfo`);

        };


        const handleVehicleInsurance = (car) => {

           if (car.insurance != null) {
                handleSelect(car.car._id);
                router.push(`vehicleOptions/VehicleInsurance`);
           } else {

                //alert("no assurance")
           }

        };

       // console.log('Rendering vehicle:', item); // Log the item being rendered

        return (

            <View style={{marginBottom:40}} >

                <View >
                    <View style={styles.vehicleHeader}>

                        <Text
                            style={[
                                styles.vehicleName,
                                item.selected && styles.vehicleNameSelected,
                            ]}
                        >
                            {item.car.brand} {item.car.model} {item.car.year}
                        </Text>

                        {!item.selected && (
                            <TouchableOpacity
                                onPress={() => handleDelete(item.car)}
                                style={styles.deleteButton}
                            >
                            <Text style={styles.deleteButtonText}>{t('vehicleList.remove')}</Text>
                            <Icon name="delete" size={20} color="#000" />
                            </TouchableOpacity>
                        )}

                        {item.selected && (
                            <View style={styles.selectedBadge}>
                            <Text style={styles.selectedText}>{t('vehicleList.selected')}</Text>
                            <Icon name="check-circle" size={20} color="white" />
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <TouchableOpacity style={styles.infoBox} onPress={() => handleVehicleInfo(item)}>
                        <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>{t('vehicleList.vehicleInfo')}</Text>
                        <Text style={styles.infoSubtitle}>
                        {t('vehicleList.vehicleInfoSubtitle')}
                        </Text>
                        </View>
                        <Icon name="chevron-right" size={20} color="#000" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.infoBox, styles.insuranceBox]} onPress={() => handleVehicleInsurance(item)}>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTitle}>{t('vehicleList.insuranceInfo')}</Text>
                            <Text style={styles.infoSubtitle}>
                            {t('vehicleList.insuranceInfoSubtitle')}       
                                </Text>
                        </View>
                        <Icon name="chevron-right" size={20} color="#000" />
                    </TouchableOpacity>
                </View>

            </View>
    );
  };

    return (
        <SafeAreaView style={styles.vehicleContainer}>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems:"center" }}>
                <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => { router.back() }}>
                    <AntDesign name='arrowleft' size={20} color="#19363C" style={{ fontWeight: "200" }} /><Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
                </TouchableOpacity>

                <View>
                    <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>{t('vehicleList.title')}</Text>
                </View>
            </View>

            {   loading ?
                    <View style={{ flex: 1, justifyContent: "center", alignItems:"center" }}>
                        <ActivityIndicator size="large" color="#0B8BA8" />
                    </View>
                    : 

                    <FlatList
                        data={vehicles}
                        //keyExtractor={(item) => item._id.toString()}
                        renderItem={renderVehicle}
                        contentContainerStyle={styles.listContainer}
                        ListHeaderComponent={<Text style={styles.subtitle}>{t('vehicleList.myVehicles')}</Text>}
                        ListFooterComponent={
                            <TouchableOpacity style={styles.addButton} onPress={handleAddVehicle}>
                                <Text style={styles.addButtonText}>{t('vehicleList.addVehicle')}</Text>
                            </TouchableOpacity>
                        }
                    />
        
            }
    </SafeAreaView>
);
};

const styles = StyleSheet.create({

    vehicleContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: "#FFFFFF",
    },

    listContainer: {
        paddingHorizontal: 0,
    },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    },

  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 20,
  },
 
  
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vehicleNameSelected: {
    color: '#000',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4a373',
    borderRadius: 5,
    padding: 5,
  },
  selectedText: {
    color: '#fff',
    marginRight: 5,
  },
  infoContainer: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 10,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoTitle: {
    fontWeight: 'bold',
  },
  infoTextContainer: {
    flexShrink: 1,
  },
  infoSubtitle: {
    color: '#777',
  },
  insuranceBox: {
    backgroundColor: '#f8f8f8',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  deleteButtonText: {
    marginLeft: 5,
  },
  addButton: {
      backgroundColor: '#0B8BA8',
    padding: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default VehicleList;

