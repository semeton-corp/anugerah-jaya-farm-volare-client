import { CgLayoutGrid } from "react-icons/cg";
import {
  getCurrentUserCagePlacement,
  getCurrentUserStorePlacement,
  getCurrentUserWarehousePlacement,
} from "../services/placement";

const getCurrentPlacementId = async (userId, role) => {
  let placementIds = [];
  try {
    let currentPlacementResponse;
    switch (role) {
      case "Pekerja Telur":
      case "Pekerja Kandang":
        currentPlacementResponse = await getCurrentUserCagePlacement();
        break;
      case "Pekerja Toko":
        currentPlacementResponse = await getCurrentUserStorePlacement();
        break;
      case "Pekerja Gudang":
        currentPlacementResponse = await getCurrentUserWarehousePlacement();
        break;
    }
    console.log("currentPlacementResponse", currentPlacementResponse);
    if (currentPlacementResponse.status == 200) {
      const placementName =
        role == "Pekerja Telur" || role == "Pekerja Kandang"
          ? "cage"
          : role == "Pekerja Toko"
          ? "store"
          : "warehouse";
      const placementIds = currentPlacementResponse.data.data.map(
        (item) => item[placementName].id
      );
      console.log({ placementIds });
    }
  } catch (error) {
    console.log("error", error);
  }
};
const getNotificationsPlacementsIds = async (userId, role) => {
  try {
    switch (role) {
      case "Pekerja Telur":
      case "Pekerja Kandang":
      case "Pekerja Toko":
      case "Pekerja Gudang":
        getCurrentPlacementId(userId, role);
        break;
      default:
        return [];
    }
  } catch (error) {
    console.log("error", error);
  }
};
export default getNotificationsPlacementsIds;
