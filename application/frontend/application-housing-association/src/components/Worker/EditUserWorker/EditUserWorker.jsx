import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../../config";
import { Footer } from "../../Footer/Footer";
import "./EditUserWorkerStyle.css";
import { NavbarWorker } from "../NavbarWorker/NavbarWorker";
import { EditUserInformationModalWorker } from "../EditUserInformationModalWorker/EditUserInformationModalWorker";

export const EditUserWorker = () => {
  const navigate = useNavigate();
  const [workerData, setWorkerData] = useState(null);
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

    fetch(`${config.BASE_URL}/get-information-about-worker`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Błąd przy pobieraniu danych pracownika");
        }
        return response.json();
      })
      .then((data) => {
        setWorkerData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd:", error);
        toast.error("Nie udało się pobrać danych pracownika");
        setLoading(false);
      });
  }, []);

  const handleEditClick = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const onSaveModal = (updatedWorker) => {
    setWorkerData(updatedWorker);
  };

  if (loading) {
    return (
      <div className="start-window-worker-container">
        <div className="start-window-worker-navbar">
          <NavbarWorker />
        </div>
        <div className="start-window-worker-content">
          <p>Ładowanie danych pracownika...</p>
        </div>
        <div className="footer-start-window-worker">
          <Footer />
        </div>
      </div>
    );
  }

  if (!workerData) {
    return (
      <div className="start-window-worker-container">
        <div className="start-window-worker-navbar">
          <NavbarWorker />
        </div>
        <div className="start-window-worker-content">
          <p>Nie znaleziono danych pracownika.</p>
        </div>
        <div className="footer-start-window-worker">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="start-window-worker-container">
        <div className="start-window-worker-navbar">
          <NavbarWorker />
        </div>
        <div className="start-window-worker-content">
          <div className="edit-user-section-worker">
            <div className="edit-user-worker-edit-section">
              <h2>Edytowanie informacji o pracowniku</h2>
              <div className="edit-user-grid-worker">
                <div className="edit-user-grid-worker-container">
                  <p>
                    <strong>Imię:</strong> {workerData.first_name}
                  </p>
                  <p>
                    <strong>Nazwisko:</strong> {workerData.surname}
                  </p>
                  <p>
                    <strong>Email:</strong> {workerData.email_address}
                  </p>
                  <p>
                    <strong>Rola:</strong> {mapRole(workerData.role)}
                  </p>
                </div>
              </div>
              <div className="form-actions-edit-user-worker">
                <button id="submit-button-edit-user-worker" onClick={handleEditClick}>
                  Edytuj
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-start-window-worker">
          <Footer />
        </div>
      </div>

      {openModal && (
        <EditUserInformationModalWorker
          isOpen={openModal}
          handleClose={handleCloseModal}
          user={workerData}
          onSave={onSaveModal}
        />
      )}
    </>
  );
};

