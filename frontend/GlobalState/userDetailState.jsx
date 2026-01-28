import { atom } from "recoil";

export const userDetailsState = atom({
  key: "userDetailsState",
  default: {
    email: "",
    name: "",
    lastName: "",
    phone: "",
    address: "",
    postalCode: "",
    companyName: "",
    province: "",
    city: "",
    country: "",
    gender: "",
    birthDay: "",
    licenseNumber: "",
    licenseDelivery: "",
    licenseExpiration: "",
    licenseMention: "",
    licenseCategory: "",
    alternateAddress: "",
    alternateCity: "",
    alternatePostalCode: "",
    alternateCountry: "",
    alternateProvince: "",
    typeAccount: "free",
  },
});

export const userInfoGatherState = atom({
  key: "userInfoGatherState",
  default: [
    {
      id: 0,
      title: "Information personnelles",
      subtitle: "4 minutes",
      completion: 0,
      actualstep: 0,
      nbstep: 4,
    },
    {
      id: 1,
      title: "Information du vehicules",
      subtitle: "8 minutes",
      completion: 0,
      actualstep: 0,
      nbstep: 4,
    },
    {
      id: 2,
      title: "Informations d'assurances",
      subtitle: "8 minutes",
      completion: 0,
      actualstep: 0,
      nbstep: 4,
    },
  ],
});

export const lastVehicleState = atom({
  key: "lastVehicleState",
  default: null,
});

export const licenceScanState = atom({
  key: "licenceScanState",
  default: false,
});
