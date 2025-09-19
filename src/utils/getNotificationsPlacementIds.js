import { CgLayoutGrid } from "react-icons/cg";
import {
  getCurrentUserCagePlacement,
  getCurrentUserStorePlacement,
  getCurrentUserWarehousePlacement,
} from "../services/placement";
import { getCage } from "../services/cages";
import { getWarehouses } from "../services/warehouses";
import { getStores } from "../services/stores";

const getCurrentPlacementIds = async (userId, role) => {
  let keyName;

  try {
    let currentPlacementResponse;
    switch (role) {
      case "Pekerja Telur":
      case "Pekerja Kandang":
        currentPlacementResponse = await getCurrentUserCagePlacement();
        keyName = "cageIds";
        break;
      case "Pekerja Toko":
        currentPlacementResponse = await getCurrentUserStorePlacement();
        keyName = "storeIds";
        break;
      case "Pekerja Gudang":
        currentPlacementResponse = await getCurrentUserWarehousePlacement();
        keyName = "warehouseIds";
        break;
      default:
        return {
          storeIds: undefined,
          warehouseIds: undefined,
          cageIds: undefined,
        };
    }
    console.log("currentPlacementResponse", currentPlacementResponse);
    if (currentPlacementResponse?.status === 200) {
      const placementName =
        role === "Pekerja Telur" || role === "Pekerja Kandang"
          ? "cage"
          : role === "Pekerja Toko"
          ? "store"
          : "warehouse";

      const ids = currentPlacementResponse.data.data.map(
        (item) => item[placementName].id
      );

      const finalIds = ids.length > 0 ? ids : undefined;

      return {
        storeIds: keyName === "storeIds" ? finalIds : undefined,
        warehouseIds: keyName === "warehouseIds" ? finalIds : undefined,
        cageIds: keyName === "cageIds" ? finalIds : undefined,
      };
    }

    return {
      storeIds: undefined,
      warehouseIds: undefined,
      cageIds: undefined,
    };
  } catch (error) {
    console.log("error", error);
  }
};

const getManagedPlacementIds = async (userId, role) => {
  const selectedSite =
    role === "Owner" ? 0 : localStorage.getItem("locationId");

  try {
    switch (role) {
      case "Kepala Kandang": {
        const cageResponse = await getCage(selectedSite);
        const warehouseResponse = await getWarehouses(selectedSite);

        const cageIds =
          cageResponse?.status === 200
            ? cageResponse.data.data.map((item) => item.id)
            : undefined;

        const warehouseIds =
          warehouseResponse?.status === 200
            ? warehouseResponse.data.data.map((item) => item.id)
            : undefined;

        return {
          storeIds: undefined,
          warehouseIds,
          cageIds,
        };
      }

      case "Owner": {
        const storeResponse = await getStores(selectedSite);
        const cageResponse = await getCage(selectedSite);
        const warehouseResponse = await getWarehouses(selectedSite);

        const storeIds =
          storeResponse?.status === 200
            ? storeResponse.data.data.map((item) => item.id)
            : undefined;

        const cageIds =
          cageResponse?.status === 200
            ? cageResponse.data.data.map((item) => item.id)
            : undefined;

        const warehouseIds =
          warehouseResponse?.status === 200
            ? warehouseResponse.data.data.map((item) => item.id)
            : undefined;

        return {
          storeIds,
          warehouseIds,
          cageIds,
        };
      }

      default:
        return {
          storeIds: undefined,
          warehouseIds: undefined,
          cageIds: undefined,
        };
    }
  } catch (error) {
    console.error("error getManagedPlacementIds:", error);
    return {
      storeIds: undefined,
      warehouseIds: undefined,
      cageIds: undefined,
    };
  }
};

const getNotificationsPlacementsIds = async (userId, role) => {
  let placementIds;
  try {
    switch (role) {
      case "Pekerja Telur":
      case "Pekerja Kandang":
      case "Pekerja Toko":
      case "Pekerja Gudang":
        placementIds = await getCurrentPlacementIds(userId, role);
        break;
      case "Kepala Kandang":
      case "Owner":
        placementIds = await getManagedPlacementIds(userId, role);
        break;
      default:
        return {
          storeIds: undefined,
          warehouseIds: undefined,
          cageIds: undefined,
        };
    }
    return placementIds;
  } catch (error) {
    console.log("error", error);
  }
};

export default getNotificationsPlacementsIds;
