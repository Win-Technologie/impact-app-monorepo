import { atom } from "recoil";

export const notificationsState = atom({
  key: "notificationsState",
  default: [],
});

export default notificationsState;
