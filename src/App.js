import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import AppointmentDashboard from "./Pages/AppartmentsDashboard";
import TenantsPage from "./Pages/TenantsPage";
import ApartmentsListPage from "./Pages/ApartmentsListPage";
import AddTenantPage from "./Pages/AddTenantPage";
import EditTenantPage from "./Pages/EditTenantPage";
import AddPropertyPage from "./Pages/AddApartmentPropertyPage";
import EditApartmentPage from "./Pages/EditApartmentPage";
import PaymentsListPage from "./Pages/RentsPaymentPage";
import AddPaymentPage from "./Pages/AddPaymentPage";
import EditPaymentPage from "./Pages/EditPaymentPage";
import VehicleDashboard from "./Pages/VehicleManagementDashboard";
import AddVehiclePage from "./Pages/AddVehicleRecordPage";
import VehicleListPage from "./Pages/ListofVehiclesPage";
import EditVehiclePage from "./Pages/EditVehiclePage";
import AddMaintenancePage from "./Pages/CarMaintenanceForms";
import MaintenanceListPage from "./Pages/CarMaintenanceList";
import EditMaintenancePage from "./Pages/EditCarMaintenance";
import ApartmentTenantsPage from "./Pages/ApartmentTenantsPage";
import SettingsPage from "./Pages/SettingsPage";
import ProtectedRoute from "./Utils/ProtectedRoute";
//import CarRentalDashboard from "./layouts/CarRentalDashboard";
import { DriversProvider } from "./Context/DriverContext";
import { ContractsProvider } from "./Context/ContractsContext";
import { ContractPaymentProvider } from "./Context/ContractPaymentContext";

import DriversPage from './Pages/DriversPage'
import ContractsPage from "./Pages/ContractsPage";
import ContractForm from "./Pages/ContractsForm";
import EditContractForm from "./Pages/ContractEditingForm";
import ContractDetails from "./Pages/ContractDetailsPage";


import ContractPaymentsList from "./Pages/ContractPaymentPage";
import AddContractPayment from "./Pages/AddContractPaymentForm";
import EditContractPayment from "./Pages/EditContractPaymentPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage/>}/>

        {/* Apartment Dashboard Routes */}
       <Route path="/apartments/dashboard" element={< AppointmentDashboard />} />
       <Route path="/apartments/tenants" element={<TenantsPage/>}/>
       <Route path="/apartments/list" element={<ApartmentsListPage/>}/>
       <Route path="/apartments/add_tenant_record" element={<AddTenantPage/>}/>
       <Route path="/apartments/tenant/edit/:Id" element={<EditTenantPage/>}/>
       <Route path="/apartments/add_property" element={<AddPropertyPage/>}/>
       <Route path="/apartments/:apartmentId/tenants" element={<ApartmentTenantsPage/>}/>
       <Route path="/apartment/edit/:Id" element={<EditApartmentPage/>}/>
       <Route path="/apartments/payment/list" element={<PaymentsListPage/>}/>
       <Route path="/apartment/add_payment" element={<AddPaymentPage/>}/>
       <Route path="/apartment/edit_payment/:Id" element={<EditPaymentPage/>}/>

       <Route path="/vehicles/dashboard" element={<ContractPaymentProvider><ContractsProvider><VehicleDashboard/></ContractsProvider></ContractPaymentProvider>}/>
       <Route path="/vehicle/add_record" element={<DriversProvider><AddVehiclePage/></DriversProvider>}/>
       <Route path="/vehicles/list" element={<VehicleListPage/>}/>
       <Route path="/vehicle/edit_record/:Id" element={<DriversProvider><EditVehiclePage/></DriversProvider>}/>
       <Route path="/vehicle/add_maintenance" element={<AddMaintenancePage/>}/>
       <Route path='/vehicle/maintainance_list' element={<MaintenanceListPage/>}/>
       <Route path='/vehicle/edit_maintenance_record/:Id' element={<EditMaintenancePage/>}/>

        {/* Car Rental Dashboard Routes */}
       {/* <Route path="/cars/*" element={<CarRentalDashboard />} /> */}
        <Route path='/driver/list' element={< DriversProvider><DriversPage/></DriversProvider>}/>
        <Route path='/contracts/list' element={< ContractsProvider><ContractsPage/></ContractsProvider>}/>
        <Route path='/contract/form' element={< ContractsProvider><DriversProvider><ContractForm/></DriversProvider></ContractsProvider>}/>
        <Route path='/edit_contract/:id' element={< ContractsProvider><DriversProvider><EditContractForm/></DriversProvider></ContractsProvider>}/>
        <Route path='/contract_details/:id' element={< ContractsProvider><DriversProvider><ContractDetails/></DriversProvider></ContractsProvider>}/>


      <Route path='/contract_payment/list' element={< ContractPaymentProvider><DriversProvider><ContractPaymentsList/></DriversProvider></ContractPaymentProvider>}/>
      <Route path='/add_contract_payment' element={<ContractPaymentProvider><DriversProvider><ContractsProvider><AddContractPayment/></ContractsProvider></DriversProvider></ContractPaymentProvider>}/>
      <Route path='/edit_contract_payment/:id' element={<ContractPaymentProvider><DriversProvider><ContractsProvider><EditContractPayment/></ContractsProvider></DriversProvider></ContractPaymentProvider>}/>



        


      </Routes>
    </Router>
  );
}