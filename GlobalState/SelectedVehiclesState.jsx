// GlobalState/selectedVehicleState.js
import { atom } from 'recoil';

export const SelectedVehicleState = atom({
  key: 'selectedVehicleState',
  default: null,
});
