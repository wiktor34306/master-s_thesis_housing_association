import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import config from "../../../config";
import "./EditUserInformationModalAdminStyle.css";

export const EditUserInformationModalAdmin = ({
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
        `${config.BASE_URL}/edit-information-about-admin`,
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
        toast.success(
          data.message || "Dane administratora zaktualizowane pomyślnie."
        );
        if (onSave) onSave(data.user);
        handleClose();
      } else {
        toast.error(
          data.error || "Błąd przy aktualizacji danych administratora."
        );
      }
    } catch (error) {
      console.error("Błąd podczas edycji danych administratora:", error);
      toast.error("Wystąpił błąd podczas edycji danych administratora.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="edit-user-information-modal-title"
      aria-describedby="edit-user-information-modal-description"
    >
      <Box className="edit-user-information-modal-admin">
        <h2 id="edit-user-information-modal-title">
          Edytuj informacje o administratorze
        </h2>
        <form onSubmit={handleSubmit} className="edit-user-information-form-admin">
          <div className="form-group-admin-user">
            <label htmlFor="edit-firstName">Imię</label>
            <input
              className="input-form-edit-user-info-detail-admin"
              type="text"
              id="edit-firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Wpisz imię"
            />
          </div>
          <div className="form-group-admin-user">
            <label htmlFor="edit-surname">Nazwisko</label>
            <input
              type="text"
              className="input-form-edit-user-info-detail-admin"
              id="edit-surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              placeholder="Wpisz nazwisko"
            />
          </div>
      <div className="modal-buttons-edit-user-info-detail-admin">
          <div className="modal-buttons-edit-user">
            <Button type="submit" variant="contained" id="edit-user-information-accept-button-admin">
              Zapisz
            </Button>
            <Button
              variant="contained"
              onClick={handleClose}
              id="edit-user-information-accept-button-admin"
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
