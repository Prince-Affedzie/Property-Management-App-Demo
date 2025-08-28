import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAllContracts,
  getSingleContract,
  createContract,
  updateContract,
  deleteContract,
} from "../APIS/APIS";

const ContractsContext = createContext();

export const useContracts = () => {
  return useContext(ContractsContext);
};

export const ContractsProvider = ({ children }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all contracts
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await getAllContracts();
      setContracts(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single contract
  const fetchContractById = async (id) => {
    try {
      const res = await getSingleContract(id);
      return res.data;
    } catch (err) {
      setError(err);
    }
  };

  // Add contract
  const addContract = async (data) => {
    try {
      const res = await createContract(data);
      setContracts([...contracts, res.data]);
    } catch (err) {
      setError(err);
    }
  };

  // Edit contract
  const editContract = async (id, data) => {
    try {
      const res = await updateContract(id, data);
      setContracts(
        contracts.map((contract) =>
          contract._id === id ? res.data : contract
        )
      );
    } catch (err) {
      setError(err);
    }
  };

  // Remove contract
  const removeContract = async (id) => {
    try {
      await deleteContract(id);
      setContracts(contracts.filter((contract) => contract._id !== id));
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  return (
    <ContractsContext.Provider
      value={{
        contracts,
        loading,
        error,
        fetchContracts,
        fetchContractById,
        addContract,
        editContract,
        removeContract,
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
};
