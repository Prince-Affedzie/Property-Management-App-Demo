// src/context/ContractPaymentContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getAllContractPayments,
  getSingleContractPayment,
  addContractPayment,
  updateContractPayment,
  deleteContractPayment,
} from "../APIS/APIS";

const ContractPaymentContext = createContext();

export const ContractPaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await getAllContractPayments();
      setPayments(res.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };
  

  // Add payment
  const createPayment = async (data) => {
    try {
      const res = await addContractPayment(data);
      setPayments((prev) => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  };

  // Update payment
  const editPayment = async (id, data) => {
    try {
      const res = await updateContractPayment(id, data);
      setPayments((prev) =>
        prev.map((p) => (p._id === id ? res.data : p))
      );
      return res.data;
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  };

  // Delete payment
  const removePayment = async (id) => {
    try {
      await deleteContractPayment(id);
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <ContractPaymentContext.Provider
      value={{
        payments,
        loading,
        fetchPayments,
        createPayment,
        editPayment,
        removePayment,
      }}
    >
      {children}
    </ContractPaymentContext.Provider>
  );
};

export const useContractPayments = () => useContext(ContractPaymentContext);
