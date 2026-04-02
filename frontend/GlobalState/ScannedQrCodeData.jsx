import { atom } from "recoil";
export const ScannedQrCodeData = atom({
  key: "ScannedQrCodeData",
  default: {
    owner: {},
    vehicle: {},
    insurance: {},
    driverLicense: {},
  },
});
