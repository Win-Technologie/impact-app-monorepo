import { atom } from "recoil";

// Per-category notification preferences. Stored as an object so UI can toggle each.
export const notificationsPrefState = atom({
  key: "notificationsPrefState",
  default: {
    general: true,
    updates: true,
    promotions: false,
    security: true,
  },
});

export default notificationsPrefState;
