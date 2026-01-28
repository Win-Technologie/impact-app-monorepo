import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import Modal from 'react-native-modal';
import { useTranslation } from 'react-i18next';




const LoadingModal = ({ modalVisible, setModalVisible }) => {

	const { t } = useTranslation();


	return (
		<Modal
			backdropOpacity={0.7}
			isVisible={modalVisible}
			onRequestClose={() => {
				setModalVisible(!modalVisible);
			}}
		>
			<View style={styles.modal}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator size="small" color="#1B6878" />
					<Text style={{ marginTop: 10, fontSize: 12, color: '#fff' }}> {t('pleasewait')} </Text>
				</View>
			</View>


		</Modal>
	);
};


const styles = StyleSheet.create({
	modal: {
		height: 30,
		alignSelf: 'center',
	},
});


export default LoadingModal;
