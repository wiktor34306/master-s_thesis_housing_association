import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import config from "../../../config";
import "./EditUserInformationModalWorkerStyle.css";

export const EditUserInformationModalWorker = ({
  isOpen,
  handleClose,
  user,
  onSave,
}) => {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      setFirstName(user.first_name || "");
      setSurname(user.surname || "");
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      first_name: firstName,
      surname: surname,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.BASE_URL}/edit-information-about-worker`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Dane pracownika zaktualizowane pomyślnie.");
        if (onSave) onSave(data.user);
        handleClose();
      } else {
        toast.error(data.error || "Błąd przy aktualizacji danych pracownika.");
      }
    } catch (error) {
      console.error("Błąd podczas edycji danych pracownika:", error);
      toast.error("Wystąpił błąd podczas edycji danych pracownika.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="edit-user-information-modal-title"
      aria-describedby="edit-user-information-modal-description"
    >
      <Box className="edit-user-information-modal-worker">
        <h2 id="edit-user-information-modal-title">Edytuj informacje o pracowniku</h2>
        <form onSubmit={handleSubmit} className="edit-user-information-form-worker">
          <div className="form-group-worker-user">
            <label htmlFor="edit-firstName">Imię</label>
            <input
              className="input-form-edit-user-info-detail-worker"
              type="text"
              id="edit-firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Wpisz imię"
            />
          </div>
          <div className="form-group-worker-user">
            <label htmlFor="edit-surname">Nazwisko</label>
            <input
              type="text"
              className="input-form-edit-user-info-detail-worker"
              id="edit-surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              placeholder="Wpisz nazwisko"
            />
          </div>
          <div className="modal-buttons-edit-user-info-detail-worker">
            <div className="modal-buttons-edit-user">
              <Button
                type="submit"
                variant="contained"
                id="edit-user-information-accept-button-worker"
              >
                Zapisz
              </Button>
              <Button
                variant="contained"
                onClick={handleClose}
                id="edit-user-information-accept-button-worker"
              >
                Anuluj
              </Button>
            </div>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

