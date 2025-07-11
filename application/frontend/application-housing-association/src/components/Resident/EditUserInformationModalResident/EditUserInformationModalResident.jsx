import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import config from "../../../config";
import "./EditUserInformationModalResidentStyle.css";

export const EditUserInformationModalResident = ({
  isOpen,
  handleClose,
  user,
  onSave,
}) => {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      setFirstName(user.first_name || "");
      setSurname(user.surname || "");
      setPhoneNumber(user.phone_number || "");
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      first_name: firstName,
      surname: surname,
      phone_number: phoneNumber,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.BASE_URL}/edit-information-about-resident/${user.resident_id}`,
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
          data.message || "Dane mieszkańca zaktualizowane pomyślnie."
        );
        if (onSave) onSave(data.resident);
        handleClose();
      } else {
        toast.error(
          data.error || "Błąd przy aktualizacji danych mieszkańca."
        );
      }
    } catch (error) {
      console.error("Błąd podczas edycji danych mieszkańca:", error);
      toast.error("Wystąpił błąd podczas edycji danych mieszkańca.");
    }
  };


  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="edit-user-information-modal-title"
      aria-describedby="edit-user-information-modal-description"
    >
      <Box className="edit-user-information-modal-resident">
        <h2 id="edit-user-information-modal-title">
          Edytuj informacje o mieszkańcu
        </h2>
        <form onSubmit={handleSubmit} className="edit-user-information-form-resident">
          <div className="form-group-resident-user">
            <label htmlFor="edit-firstName">Imię</label>
            <input
              className="input-form-edit-user-info-detail-resident"
              type="text"
              id="edit-firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Wpisz imię"
            />
          </div>
          <div className="form-group-resident-user">
            <label htmlFor="edit-surname">Nazwisko</label>
            <input
              type="text"
              className="input-form-edit-user-info-detail-resident"
              id="edit-surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              placeholder="Wpisz nazwisko"
            />
          </div>
          <div className="form-group-resident-user">
            <label htmlFor="edit-phone">Numer telefonu</label>
            <input
              type="text"
              className="input-form-edit-user-info-detail-resident"
              id="edit-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="Wpisz numer telefonu"
            />
          </div>
          <div className="modal-buttons-edit-user-info-detail-resident">
            <div className="modal-buttons-edit-user">
              <Button
                type="submit"
                variant="contained"
                id="edit-user-information-accept-button-resident"
              >
                Zapisz
              </Button>
              <Button
                variant="contained"
                onClick={handleClose}
                id="edit-user-information-accept-button-resident"
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

