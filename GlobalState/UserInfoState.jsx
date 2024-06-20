import { atom } from 'recoil';

export const UserInfoState = atom({
  key: 'userInfoState',
  default: {
    owner: {
      name: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      province: '',
    },
    driverLicense: {},
    insurance: {},
    vehicle: {},
  },
});