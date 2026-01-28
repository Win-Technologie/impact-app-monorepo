import { atom } from 'recoil';

export const vehicleDetailsState = atom({
    key: 'vehicleDetailsState', 
    default: {
        vehicleBrand:'',
        vehicleModel: '',
        vehicleYear: '',
        vehicleColor: '',
        vehiclePlateNumber:'',
        vehicleSerialNumber:'',
        vehicleDossierNumber: '',
        vehiclecategorieUsage: '',
        vehiclenumeroEssieux: '',
        vehicleNetWeight: '',
        vehicleCylinder: '',
        vehicleEssieux: '',
        vehicleNumeroCertificat:'',
        vehicleCerticateDeliveryDate: '',
        vehicleCerticateExpirationDate: '',
        vehicleOwnerFirstname: '',
        vehicleOwnerName: '',
        vehicleOwnerPhone: '',
        vehicleOwnerAddress: '',
        vehicleOwnerCity: '',
        vehicleOwnerPostalCode: '',
        vehicleOwnerCountry: '',
        vehicleOwnerProvince: '',

  },
});
