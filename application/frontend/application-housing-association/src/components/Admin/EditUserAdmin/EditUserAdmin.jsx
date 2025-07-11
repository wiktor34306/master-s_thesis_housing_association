import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarAdmin } from "../NavbarAdmin/NavbarAdmin";
import { Footer } from "../../Footer/Footer";
import { EditUserInformationModalAdmin } from "../EditUserInformationModalAdmin/EditUserInformationModalAdmin";
import "./EditUserAdminStyle.css";

export const EditUserAdmin = () => {
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  const mapRole = (role) => {
    switch (role) {
      case "administrator":
        return "administrator";
      case "worker":
        return "pracownik spółdzielni";
      case "resident":
        return "mieszkaniec spółdzielni";
      default:
        return role;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Brak tokena autoryzacyjnego");
      setLoading(false);
      return;
    }

    fetch(`${config.BASE_URL}/get-information-about-admin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Błąd przy pobieraniu danych administratora");
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAdminData(data[0]);
        } else {
          setAdminData(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd:", error);
        toast.error("Nie udało się pobrać danych administratora");
        setLoading(false);
      });
  }, []);

  const handleEditClick = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const onSaveModal = (updatedUser) => {
    setAdminData(updatedUser);
  };

  if (loading) {
    return (
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarAdmin />
        </div>
        <div className="start-window-admin-content">
          <p>Ładowanie danych administratora...</p>
        </div>
        <div className="footer-start-window-admin">
          <Footer />
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarAdmin />
        </div>
        <div className="start-window-admin-content">
          <p>Nie znaleziono danych administratora.</p>
        </div>
        <div className="footer-start-window-admin">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarAdmin />
        </div>
        <div className="start-window-admin-content">
          <div className="edit-user-section-admin">
            <div className="edit-user-admin-edit-section">
              <h2>Edytowanie informacji o administratorze</h2>
              <div className="edit-user-grid-admin">
                <div className="edit-user-grid-admin-container">
                  <p>
                    <strong>Imię:</strong> {adminData.first_name}
                  </p>
                  <p>
                    <strong>Nazwisko:</strong> {adminData.surname}
                  </p>
                  <p>
                    <strong>Email:</strong> {adminData.email_address}
                  </p>
                  <p>
                    <strong>Rola:</strong> {mapRole(adminData.role)}
                  </p>
                </div>
              </div>
        
              <div className="form-actions-edit-user-admin">
                <button id="submit-button-edit-user-admin" onClick={handleEditClick}>
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
        <EditUserInformationModalAdmin
          isOpen={openModal}
          handleClose={handleCloseModal}
          user={adminData}
          onSave={onSaveModal}
        />
      )}
    </>
  );
};

