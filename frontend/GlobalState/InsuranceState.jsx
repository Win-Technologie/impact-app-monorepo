import { atom, selector } from "recoil";

export const policyNumberState = atom({
  key: "policyNumberState",
  default: "",
});
export const expirationDateState = atom({
  key: "expirationDateState",
  default: "",
});
export const insuranceCompanyState = atom({
  key: "insuranceCompanyState",
  default: "",
});
export const insuranceInfoState = atom({
  key: "insuranceInfoState",
  default: [],
});
export const userVehicleState = atom({ key: "userVehicleState", default: "" });

export const insuranceState = atom({
  key: "insuranceState",
  default: {
    idCar: "",
    insuranceNumber: "",
    insuranceExpirationDate: "",
    insuranceFirmName: "",
    insuranceFirmPhone: "",
    insuranceFirmAddress: "",
    insuranceFirmCity: "",
    insuranceFirmPostalCode: "",
    insuranceFirmAddress: "",
    insuranceFirmCity: "",
    insuranceFirmPostalCode: "",
    insuranceFirmCountry: "",
    insuranceFirmProvince: "",
    insuranceOwnerName: "",
    insuranceOwnerPhone: "",
    insuranceOwnerAddress: "",
    insuranceOwnerCity: "",
    insuranceOwnerPostalCode: "",
    insuranceOwnerCountry: "",
    insuranceOwnerProvince: "",
  },
});
