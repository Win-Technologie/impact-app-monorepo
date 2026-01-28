import { atom } from "recoil";

export const VehicleUserInfoState = atom({
  key: "vehicleUserInfoState",
  default: {
    brand: "",
    model: "",
    year: "",
    color: "",
    plate: "",
    serialNumber: "",
    immatriculation: {
      categorieUsage: "",
      cylindree: "",
      dateDelivrance: "",
      dateExpiration: "",
      masseNette: "",
      numeroCertificatImmatriculation: "",
      numeroDossier: "",
      numeroEssieux: "",
      serialNumber: "",
    },
  },
});
