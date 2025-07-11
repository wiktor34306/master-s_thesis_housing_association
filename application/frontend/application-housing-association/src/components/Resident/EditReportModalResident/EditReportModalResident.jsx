import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import config from "../../../config";
import "./EditReportModalResidentStyle.css";

export const EditReportModalResident = ({ isOpen, handleClose, report, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen && report) {
      setTitle(report.title || "");
      setDescription(report.description || "");
    }
  }, [isOpen, report]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { title, description };
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.BASE_URL}/update-report/${report.report_id}`,
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
        toast.success(data.message || "Zgłoszenie zaktualizowane pomyślnie.");
        if (onSave) onSave(data.report);
        handleClose();
      } else {
        toast.error(data.error || "Błąd przy aktualizacji zgłoszenia.");
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji zgłoszenia:", error);
      toast.error("Wystąpił błąd podczas aktualizacji zgłoszenia.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="edit-report-modal-title"
      aria-describedby="edit-report-modal-description"
    >
      <Box className="edit-user-report-modal-resident">
        <h2 id="edit-report-modal-title">Edytuj zgłoszenie</h2>
        <form onSubmit={handleSubmit} className="edit-user-information-form-resident">
          <div className="form-group-resident-user">
            <label htmlFor="edit-title">Tytuł</label><br />
            <input
              className="input-form-edit-report-info-detail-resident"
              type="text"
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Wpisz tytuł"
            />
          </div>
          <div className="form-group-resident-user">
            <label htmlFor="edit-description">Opis</label><br />
            <textarea
              className="input-form-edit-report-info-detail-resident"
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Wpisz opis"
            />
          </div>
          <div className="modal-buttons-edit-report-info-detail-resident">
            <div className="modal-buttons-edit-user">
              <Button
                type="submit"
                variant="contained"
                id="edit-user-report-accept-button-resident"
              >
                Zapisz
              </Button>
              <Button
                variant="contained"
                onClick={handleClose}
                id="edit-user-report-accept-button-resident"
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

