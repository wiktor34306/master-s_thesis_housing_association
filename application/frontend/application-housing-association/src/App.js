import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HomePageAdmin } from './components/Admin/HomePageAdmin/HomePageAdmin';         
import { HomePageWorker } from './components/Worker/HomePageWorker/HomePageWorker';       
import { HomePageResident } from './components/Resident/HomePageResident/HomePageResident';
import { AddAdvertisementFormAdmin } from './components/Admin/AddAdvertisementFormAdmin/AddAdvertisementFormAdmin';
import { AdvertisementSettingGridAdmin } from './components/Admin/AdvertisementSettingGridAdmin/AdvertisementSettingGridAdmin';
import { LoginPage } from './components/LoginPage/LoginPage';
import { getUserRole } from './getUserRole';
import { EditAdvertisementModalAdmin } from './components/Admin/EditAdvertisementAdmin/EditAdvertisementModalAdmin';
import { ConfirmationOfAdRemovalModalAdmin } from './components/Admin/ConfirmationOfAdRemovalModalAdmin/ConfirmationOfAdRemovalModalAdmin';
import { AddAdministratorFormAdmin } from './components/Admin/AddAdministratorFormAdmin/AddAdministratorFormAdmin';
import { AddHousingAssociationFormAdmin } from './components/Admin/AddHousingAssociationFormAdmin/AddHousingAssociationFormAdmin';
import { BrowseHousingAssociationAdmin } from './components/Admin/BrowseHousingAssociationAdmin/BrowseHousingAssociationAdmin';
import { ConfirmationOfHousingAssociationRemovalModalAdmin } from './components/Admin/ConfirmationOfHousingAssociationRemovalModalAdmin/ConfirmationOfHousingAssociationRemovalModalAdmin';
import { EditHousingAssociationDetailAdmin } from './components/Admin/EditHousingAssociationDetailAdmin/EditHousingAssociationDetailAdmin';
import { NavbarAdmin } from './components/Admin/NavbarAdmin/NavbarAdmin';
import { AddResidentFormAdmin } from './components/Admin/AddResidentFormAdmin/AddResidentFormAdmin';
import { AddWorkerFormAdmin } from './components/Admin/AddWorkerFormAdmin/AddWorkerFormAdmin';
import { BrowseAllUsersAdmin } from './components/Admin/BrowseAllUsersAdmin/BrowseAllUsersAdmin';
import { ConfirmationOfUserRemovalModalAdmin } from './components/Admin/ConfirmationOfUserRemovalModalAdmin/ConfirmationOfUserRemovalModalAdmin';
import { EditUserAdmin } from './components/Admin/EditUserAdmin/EditUserAdmin';
import { NavbarWorker } from './components/Worker/NavbarWorker/NavbarWorker';
import { NavbarResident } from './components/Resident/NavbarResident/NavbarResident';
import { EditUserResident } from './components/Resident/EditUserResident/EditUserResident';
import { EditUserWorker } from './components/Worker/EditUserWorker/EditUserWorker';
import { EditUserInformationModalAdmin } from './components/Admin/EditUserInformationModalAdmin/EditUserInformationModalAdmin';
import { EditUserInformationModalResident } from './components/Resident/EditUserInformationModalResident/EditUserInformationModalResident';
import { EditUserInformationModalWorker } from './components/Worker/EditUserInformationModalWorker/EditUserInformationModalWorker';
import { BrowseEventsAdmin } from './components/Admin/BrowseEventsAdmin/BrowseEventsAdmin';
import { AddEventToCalendarAdmin } from './components/Admin/AddEventToCalendarAdmin/AddEventToCalendarAdmin';
import { ConfirmationOfEventsRemovalModalAdmin } from './components/Admin/ConfirmationOfEventsRemovalModalAdmin/ConfirmationOfEventsRemovalModalAdmin';
import { EditEventFormModalAdmin } from './components/Admin/EditEventFormModalAdmin/EditEventFormModalAdmin';
import { AddReportResident } from './components/Resident/AddReportResident/AddReportResident';
import { BrowseYourReportsResident } from './components/Resident/BrowseYourReportsResident/BrowseYourReportsResident';
import { BrowseReportsAdmin } from './components/Admin/BrowseReportsAdmin/BrowseReportsAdmin';
import { NotificationToastResident } from './components/Resident/NotificationToastResident/NotificationToastResident';
import { GenerateInvoicePdfAdmin } from './components/Admin/GenerateInvoicePdfAdmin/GenerateInvoicePdfAdmin';
import { BrowseAllInvoicesAdmin } from './components/Admin/BrowseAllInvoicesAdmin/BrowseAllInvoicesAdmin';
import { EditReportModalResident } from './components/Resident/EditReportModalResident/EditReportModalResident';
import { AddWorkerFormWorker } from './components/Worker/AddWorkerFormWorker/AddWorkerFormWorker';
import { BrowseAllUsersWorker } from './components/Worker/BrowseAllUsersWorker/BrowseAllUsersWorker';
import { ConfirmationOfUserRemovalModalWorker } from './components/Worker/ConfirmationOfUserRemovalModalWorker/ConfirmationOfUserRemovalModalWorker';
import { AddResidentFormWorker } from './components/Worker/AddResidentFormWorker/AddResidentFormWorker';
import { AddEventToCalendarWorker } from './components/Worker/AddEventToCalendarWorker/AddEventToCalendarWorker';
import { BrowseEventsWorker } from './components/Worker/BrowseEventsWorker/BrowseEventsWorker';
import { ConfirmationOfEventsRemovalModalWorker } from './components/Worker/ConfirmationOfEventsRemovalModalWorker/ConfirmationOfEventsRemovalModalWorker';
import { BrowseReportsWorker } from './components/Worker/BrowseReportsWorker/BrowseReportsWorker';
import { AddAdvertisementFormWorker } from './components/Worker/AddAdvertisementFormWorker/AddAdvertisementFormWorker';
import { AdvertisementSettingGridWorker } from './components/Worker/AdvertisementSettingGridWorker/AdvertisementSettingGridWorker';
import { EditAdvertisementModalWorker } from './components/Worker/EditAdvertisementModalWorker/EditAdvertisementModalWorker';
import { ConfirmationOfAdRemovalModalWorker } from './components/Worker/ConfirmationOfAdRemovalModalWorker/ConfirmationOfAdRemovalModalWorker';
import { GenerateInvoicePdfWorker } from './components/Worker/GenerateInvoicePdfWorker/GenerateInvoicePdfWorker';
import { ConfirmationOfInvoicesRemovalModalWorker } from './components/Worker/ConfirmationOfInvoicesRemovalModalWorker/ConfirmationOfInvoicesRemovalModalWorker';
import { BrowseAllInvoicesWorker } from './components/Worker/BrowseAllInvoicesWorker/BrowseAllInvoicesWorker';
import { AdvertisementGrid } from './components/AdvertisementGrid/AdvertisementGrid';
import { BrowseEventsResident } from './components/Resident/BrowseEventsResident/BrowseEventsResident';
import { AddAdvertisementFormResident } from './components/Resident/AddAdvertisementFormResident/AddAdvertisementFormResident';
import { AdvertisementSettingGridResident } from './components/Resident/AdvertisementSettingGridResident/AdvertisementSettingGridResident';
import { EditAdvertisementModalResident } from './components/Resident/EditAdvertisementModalResident/EditAdvertisementModalResident';
import { ConfirmationOfAdRemovalModalResident } from './components/Resident/ConfirmationOfAdRemovalModalResident/ConfirmationOfAdRemovalModalResident';
import { BrowseMyInvoicesResident } from './components/Resident/BrowseMyInvoicesResident/BrowseMyInvoicesResident';

const App = () => {
  const [role, setRole] = useState(null);

  const updateRole = (newRole) => {
    setRole(newRole);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const { role } = getUserRole();
      setRole(role);
    }
  }, []);

  const requireRole = useCallback(
    (allowedRoles, element) => {
      if (!role) {
        return <Navigate to="/" />;
      }
      if (allowedRoles.includes(role)) {
        return element;
      }
      return <Navigate to="/unauthorized" />;
    },
    [role]
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={<LoginPage onLogin={(newRole) => updateRole(newRole)} />}
        />

        <Route path="/homepageadmin" element={requireRole(["administrator"], <HomePageAdmin />)} />
        <Route path="/admin-add-advertisement" element={requireRole(["administrator"], <AddAdvertisementFormAdmin />)} />
        <Route path="/advertisement-setting-grid-admin" element={requireRole(["administrator"], <AdvertisementSettingGridAdmin />)} />
        <Route path="/edit-advertisement-modal-admin" element={requireRole(["administrator"], <EditAdvertisementModalAdmin />)}/>
        <Route path="/confirmation-of-ad-removal-modal-admin" element={requireRole(["administrator"], <ConfirmationOfAdRemovalModalAdmin />)}/>
        <Route path="/add-administrator-form-admin" element={requireRole(["administrator"], <AddAdministratorFormAdmin />)}/>
        <Route path="/add-housing-association-form-admin" element={requireRole(["administrator"], <AddHousingAssociationFormAdmin />)}/>
        <Route path="/browse-housing-association-admin" element={requireRole(["administrator"], <BrowseHousingAssociationAdmin />)}/>
        <Route path="/confirmation-of-housing-association-removal-modal-admin" element={requireRole(["administrator"], <ConfirmationOfHousingAssociationRemovalModalAdmin />)}/>
        <Route path="/edit-housing-association-detail-admin" element={requireRole(["administrator"], <EditHousingAssociationDetailAdmin />)}/>    
        <Route path="/navbar-admin" element={requireRole(["administrator"], <NavbarAdmin />)}/>
        <Route path="/add-resident-form-admin" element={requireRole(["administrator"], <AddResidentFormAdmin />)}/>
        <Route path="/add-worker-form-admin" element={requireRole(["administrator"], <AddWorkerFormAdmin />)}/>
        <Route path="/browse-all-users-admin" element={requireRole(["administrator"], <BrowseAllUsersAdmin />)}/>
        <Route path="/confirmation-of-user-removal-modal-admin" element={requireRole(["administrator"], <ConfirmationOfUserRemovalModalAdmin />)}/>
        <Route path="/edit-user-admin" element={requireRole(["administrator"], <EditUserAdmin />)}/>
        <Route path="/edit-user-information-modal-admin" element={requireRole(["administrator"], <EditUserInformationModalAdmin />)}/>
        <Route path="/browse-events-admin" element={requireRole(["administrator"], <BrowseEventsAdmin />)}/>
        <Route path="/add-event-to-calendar-admin" element={requireRole(["administrator"], <AddEventToCalendarAdmin />)}/>
        <Route path="/confirmation-of-events-removal-modal-admin" element={requireRole(["administrator"], <ConfirmationOfEventsRemovalModalAdmin />)}/>
        <Route path="/add-event-to-calendar-admin" element={requireRole(["administrator"], <AddEventToCalendarAdmin />)}/>        
        <Route path="/edit-event-form-modal-admin" element={requireRole(["administrator"], <EditEventFormModalAdmin />)}/>
        <Route path="/browse-reports-admin" element={requireRole(["administrator"], <BrowseReportsAdmin />)}/>
        <Route path="/generate-invoice-pdf-admin" element={requireRole(["administrator"], <GenerateInvoicePdfAdmin />)}/>
        <Route path="/browse-all-invoices-admin" element={requireRole(["administrator"], <BrowseAllInvoicesAdmin />)}/>
        <Route path="/advertisement-grid" element={requireRole(["administrator"], <AdvertisementGrid />)} />  

        <Route path="/homepageworker" element={requireRole(["worker"], <HomePageWorker />)} />
        <Route path="/navbar-worker" element={requireRole(["worker"], <NavbarWorker />)} />
        <Route path="/edit-user-worker" element={requireRole(["worker"], <EditUserWorker />)} /> 
        <Route path="/edit-user-information-modal-worker" element={requireRole(["worker"], <EditUserInformationModalWorker />)} />               
        <Route path="/add-worker-form-worker" element={requireRole(["worker"], <AddWorkerFormWorker />)} />               
        <Route path="/browse-all-users-worker" element={requireRole(["worker"], <BrowseAllUsersWorker />)} />               
        <Route path="/confirmation-of-user-removal-modal-worker" element={requireRole(["worker"], <ConfirmationOfUserRemovalModalWorker />)} />               
        <Route path="/add-resident-form-worker" element={requireRole(["worker"], <AddResidentFormWorker />)} />               
        <Route path="/add-event-to-calendar-worker" element={requireRole(["worker"], <AddEventToCalendarWorker />)} />               
        <Route path="/browse-events-worker" element={requireRole(["worker"], <BrowseEventsWorker />)} />               
        <Route path="/confirmation-of-events-removal-modal-worker" element={requireRole(["worker"], <ConfirmationOfEventsRemovalModalWorker />)} />               
        <Route path="/browse-reports-worker" element={requireRole(["worker"], <BrowseReportsWorker />)} />               
        <Route path="/add-advertisement-form-worker" element={requireRole(["worker"], <AddAdvertisementFormWorker />)} />               
        <Route path="/advertisement-setting-grid-worker" element={requireRole(["worker"], <AdvertisementSettingGridWorker />)} />               
        <Route path="/edit-advertisement-modal-worker" element={requireRole(["worker"], <EditAdvertisementModalWorker />)} />               
        <Route path="/confirmation-of-ad-removal-modal-worker" element={requireRole(["worker"], <ConfirmationOfAdRemovalModalWorker />)} />               
        <Route path="/generate-invoice-pdf-worker" element={requireRole(["worker"], <GenerateInvoicePdfWorker />)} />               
        <Route path="/confirmation-of-invoices-removal-modal-worker" element={requireRole(["worker"], <ConfirmationOfInvoicesRemovalModalWorker />)} />               
        <Route path="/browse-all-invoices-worker" element={requireRole(["worker"], <BrowseAllInvoicesWorker />)} />               
        <Route path="/advertisement-grid" element={requireRole(["worker"], <AdvertisementGrid />)} />               

        <Route path="/navbar-resident" element={requireRole(["resident"], <NavbarResident />)} />        
        <Route path="/homepageresident" element={requireRole(["resident"], <HomePageResident />)} />
        <Route path="/edit-user-resident" element={requireRole(["resident"], <EditUserResident />)} />
        <Route path="/edit-user-information-modal-resident" element={requireRole(["resident"], <EditUserInformationModalResident />)} />              
        <Route path="/add-report-resident" element={requireRole(["resident"], <AddReportResident />)} />              
        <Route path="/browse-your-reports-resident" element={requireRole(["resident"], <BrowseYourReportsResident />)} />              
        <Route path="/notification-toast-resident" element={requireRole(["resident"], <NotificationToastResident />)} />              
        <Route path="/edit-report-modal-resident" element={requireRole(["resident"], <EditReportModalResident />)} />              
        <Route path="/advertisement-grid" element={requireRole(["resident"], <AdvertisementGrid />)} />  
        <Route path="/browse-events-resident" element={requireRole(["resident"], <BrowseEventsResident />)} />        
        <Route path="/add-advertisement-form-resident" element={requireRole(["resident"], <AddAdvertisementFormResident />)} />        
        <Route path="/advertisement-setting-grid-resident" element={requireRole(["resident"], <AdvertisementSettingGridResident />)} />        
        <Route path="/edit-advertisement-modal-resident" element={requireRole(["resident"], <EditAdvertisementModalResident />)} />        
        <Route path="/confirmation-of-ad-removal-modal-resident" element={requireRole(["resident"], <ConfirmationOfAdRemovalModalResident />)} />        
        <Route path="/browse-my-invoices-resident" element={requireRole(["resident"], <BrowseMyInvoicesResident />)} />        

        <Route path="/unauthorized" element={<div style={{ textAlign: 'center', marginTop: '2rem' }}>Brak uprawnień do dostępu.</div>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer position="bottom-right"/>
    </BrowserRouter>
  );
};

export default App;
