import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarResident } from "../NavbarResident/NavbarResident";
import { Footer } from "../../Footer/Footer";
import "./EditUserResidentStyle.css";
import { EditUserInformationModalResident } from "../EditUserInformationModalResident/EditUserInformationModalResident";

export const EditUserResident = () => {
  const navigate = useNavigate();

  const [residentData, setResidentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Brak tokena autoryzacyjnego");
      setLoading(false);
      return;
    }

    fetch(`${config.BASE_URL}/information-about-resident`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Błąd przy pobieraniu danych mieszkańca");
        }
        return response.json();
      })
      .then((data) => {
        setResidentData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd:", error);
        toast.error("Nie udało się pobrać danych mieszkańca");
        setLoading(false);
      });
  }, []);

  const handleEditClick = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const onSaveModal = (updatedResident) => {
    setResidentData(updatedResident);
  };

  if (loading) {
    return (
      <div className="start-window-resident-container">
        <div className="start-window-admin-navbar">
          <NavbarResident />
        </div>
        <div className="start-window-admin-content">
          <p>Ładowanie danych mieszkańca...</p>
        </div>
        <div className="footer-start-window-admin">
          <Footer />
        </div>
      </div>
    );
  }

  if (!residentData) {
    return (
      <div className="start-window-resident-container">
        <div className="start-window-admin-navbar">
          <NavbarResident />
        </div>
        <div className="start-window-admin-content">
          <p>Nie znaleziono danych mieszkańca.</p>
        </div>
        <div className="footer-start-window-admin">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="start-window-resident-container">
        <div className="start-window-admin-navbar">
          <NavbarResident />
        </div>
        <div className="start-window-admin-content">
          <div className="edit-user-section-resident">
            <div className="edit-user-resident-edit-section">
              <h2>Edytowanie informacji o mieszkańcu</h2>
              <div className="edit-user-grid-resident">
                <div className="edit-user-grid-resident-container">
                  <p>
                    <strong>Imię:</strong> {residentData.first_name}
                  </p>
                  <p>
                    <strong>Nazwisko:</strong> {residentData.surname}
                  </p>
                  <p>
                    <strong>Email:</strong> {residentData.email_address}
                  </p>
                  <p>
                    <strong>Ulica:</strong> {residentData.street}
                  </p>
                  <p>
                    <strong>Numer budynku:</strong> {residentData.building_number}
                  </p>
                  <p>
                    <strong>Numer mieszkania:</strong> {residentData.apartment_number}
                  </p>
                  <p>
                    <strong>Telefon:</strong> {residentData.phone_number}
                  </p>
                </div>
              </div>
              <div className="form-actions-edit-user-resident">
                <button
                  id="submit-button-edit-user-resident"
                  onClick={handleEditClick}
                >
                  Edytuj
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-start-window-admin">
          <Footer />
        </div>
      </div>

      {openModal && (
        <EditUserInformationModalResident
          isOpen={openModal}
          handleClose={handleCloseModal}
          user={residentData}
          onSave={onSaveModal}
        />
      )}
    </>
  );
};
