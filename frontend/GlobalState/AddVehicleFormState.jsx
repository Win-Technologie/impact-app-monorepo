import { atom } from "recoil";

export const addVehicleFormState = atom({
  key: "addVehicleFormState",
  default: {
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",
    vehiclePlateNumber: "",
    vehicleSerialNumber: "",
    vehicleDossierNumber: "",
    vehiclecategorieUsage: "",
    vehiclenumeroEssieux: "",
    vehicleNetWeight: "",
    vehicleCylinder: "",
    vehicleNumeroCertificat: "",
    vehicleCerticateDeliveryDate: "",
    vehicleCerticateExpirationDate: "",
    vehicleOwnerFirstname: "",
    vehicleOwnerName: "",
    vehicleOwnerPhone: "",
    vehicleOwnerAddress: "",
    vehicleOwnerCity: "",
    vehicleOwnerPostalCode: "",
    vehicleOwnerCountry: "Canada",
    vehicleOwnerProvince: "Québec",
  },
});
