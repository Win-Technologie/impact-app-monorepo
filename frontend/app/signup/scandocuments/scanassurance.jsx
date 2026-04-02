import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import ImagePickerModal from "../../../components/ImagePickerModal";
import DualOptionButtonStep from "../../../components/SignUp/dualBottomButtonsSteps";

export default function ScanAssurance() {
	const [insuranceImage, setInsuranceImage] = useState(null);
	const [visible, setVisible] = useState(false);

	const handlePressContinue = async () => {
		try {
			const token = await AsyncStorage.getItem('userToken');
			if (!token) {
				await AsyncStorage.setItem('user_insurance', insuranceImage || '');
				Alert.alert('Succès', 'Informations enregistrées localement');
				router.replace('/signup/signUpLanding');
				return;
			}

			if (insuranceImage) {
				const data = new FormData();
				const filename = insuranceImage.split('/').pop();
				const match = /\.(\w+)$/.exec(filename);
				const type = match ? `image/${match[1]}` : 'image/jpeg';
				data.append('insurance', { uri: insuranceImage, name: filename, type });

				// try upload to dedicated endpoint (if exists), otherwise fall back to local save
				try {
					const res = await fetch(`${API_URL}users/user/upload-insurance-document`, {
						method: 'PATCH',
						headers: { Authorization: `Bearer ${token}` },
						body: data,
					});
					if (res.ok) {
						const result = await res.json();
						if (result && result.documentPath) {
							await AsyncStorage.setItem('user_insurance', result.documentPath);
						} else {
							await AsyncStorage.setItem('user_insurance', insuranceImage || '');
						}
					} else {
						// fallback local
						await AsyncStorage.setItem('user_insurance', insuranceImage || '');
					}
				} catch (err) {
					console.log('insurance upload failed, saving locally', err);
					await AsyncStorage.setItem('user_insurance', insuranceImage || '');
				}
			} else {
				await AsyncStorage.setItem('user_insurance', insuranceImage || '');
			}

			Alert.alert('Succès', 'Informations enregistrées');
			router.replace('/signup/signUpLanding');
		} catch (e) {
			console.log('Error saving insurance image', e);
			Alert.alert('Erreur', "Impossible d'enregistrer les informations");
		}
	};

	const handlePressBack = () => {
		router.back();
	};

	return (
		<View style={styles.container}>
			<Text style={[styles.titleText, { marginTop: 40, textAlign: 'center' }]}>Télécharger une photo de vos papiers d'assurances</Text>
			<View style={styles.uploadSectionLast}>
				<TouchableOpacity style={styles.UploadButton} onPress={() => setVisible(true)}>
					{!insuranceImage ? (
						<Text style={styles.uploadLabel}>Télécharger</Text>
					) : (
						<Text style={styles.uploadLabel}>Modifier</Text>
					)}
				</TouchableOpacity>
				{insuranceImage && (
					<View style={{ marginTop: 10, alignItems: 'center' }}>
						<Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Aperçu</Text>
						<Image
							source={{ uri: insuranceImage }}
							style={{ width: 180, height: 120, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' }}
							resizeMode="cover"
						/>
					</View>
				)}
			</View>
			<View style={styles.absoluteButtonContainer}>
				<DualOptionButtonStep
					onPressBack={handlePressBack}
					onPressContinue={handlePressContinue}
					disabled={!insuranceImage}
				/>
			</View>
			<ImagePickerModal
				isVisible={visible}
				onClose={() => setVisible(false)}
				setImage={setInsuranceImage}
			/>
		</View>
	);

	}

const styles = StyleSheet.create({
		absoluteButtonContainer: {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
		},
	container: {
		flex: 1,
		backgroundColor: "white",
		paddingTop: 30,
		paddingLeft: 30,
		paddingRight: 30,
		paddingBottom: 0,
		justifyContent: "flex-start",
	},
	titleText: {
		fontSize: 23,
		marginVertical: 10,
		marginBottom: 15,
		fontWeight: "bold",
		color: "#19363C",
	},
	uploadSectionLast: {
		marginBottom: 40,
		marginTop: 10,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	UploadButton: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		padding: 25,
		width: "100%",
		gap: 10,
		borderStyle: "dashed",
		borderColor: "#0B8BA8",
		alignItems: "center",
	},
	uploadLabel: {
		marginTop: 12,
		fontSize: 16,
		textAlign: "center",
		color: "#19363C",
		lineHeight: 22,
	},
	continueButton: {
		backgroundColor: '#0B8BA8',
		borderRadius: 8,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 20,
		width: '100%',
		opacity: 1,
	},
	continueButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
});
