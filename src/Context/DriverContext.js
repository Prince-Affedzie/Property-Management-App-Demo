
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../APIS/APIS";

const DriversContext = createContext();

export const useDrivers = () => useContext(DriversContext);

export const DriversProvider = ({ children }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all drivers
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const { data } = await getAllDrivers();
      setDrivers(data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add driver
  const addDriver = async (driverData) => {
    try {
      await createDriver(driverData);
      fetchDrivers();
    } catch (err) {
      console.error("Error creating driver:", err);
    }
  };

  // Edit driver
  const editDriver = async (id, driverData) => {
    try {
      await updateDriver(id, driverData);
      fetchDrivers();
    } catch (err) {
      console.error("Error updating driver:", err);
    }
  };

  // Remove driver
  const removeDriver = async (id) => {
    try {
      await deleteDriver(id);
      fetchDrivers();
    } catch (err) {
      console.error("Error deleting driver:", err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <DriversContext.Provider
      value={{
        drivers,
        loading,
        fetchDrivers,
        addDriver,
        editDriver,
        removeDriver,
      }}
    >
      {children}
    </DriversContext.Provider>
  );
};
