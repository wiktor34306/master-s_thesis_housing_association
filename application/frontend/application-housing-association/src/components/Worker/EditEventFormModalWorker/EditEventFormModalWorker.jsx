import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import config from "../../../config";
import "./EditEventFormModalWorkerStyle.css";

export const EditEventFormModalWorker = ({ 
  isOpen, 
  handleClose, 
  eventData, 
  onSave,
  userHA 
}) => {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');

  const formatDateTimeLocal = (dateObj) => {
    const pad = (n) => n < 10 ? '0' + n : n;
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
  };

  useEffect(() => {
    if (eventData) {
      setTitle(eventData.title || '');
      setDescription(eventData.description || '');
      const dt = new Date(eventData.event_date);
      setEventDate(formatDateTimeLocal(dt));
    }
  }, [eventData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      event_date: eventDate + ":00", 
      housing_association_id: userHA?.housing_association_id || null
    };
    try {
      const response = await fetch(`${config.BASE_URL}/event/${eventData.event_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Wydarzenie zaktualizowane pomyślnie.");
        if (onSave) {
          onSave(data.event);
        }
        handleClose();
      } else {
        toast.error(data.error || "Błąd przy aktualizacji wydarzenia.");
      }
    } catch (error) {
      console.error("Błąd przy aktualizacji wydarzenia:", error);
      toast.error("Wystąpił błąd przy aktualizacji wydarzenia.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="edit-event-modal-title"
      aria-describedby="edit-event-modal-description"
    >
      <Box className="edit-event-modal-worker">
        <h2 id="edit-event-modal-title">Edytuj wydarzenie</h2>
        <form onSubmit={handleSubmit} className="edit-event-form-admin">

          <div className="form-group-admin-event">
            <label htmlFor="edit-title">Tytuł</label><br />
            <input 
              className="input-form-edit-event-detail-worker"
              type="text"
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Wpisz tytuł wydarzenia"
            />
          </div>
  
          <div className="form-group-admin-event">
            <label htmlFor="edit-description-worker">Opis</label><br />
            <textarea
              id="edit-description-worker"
              className="input-form-edit-event-detail-worker"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Wpisz opis wydarzenia"
            />
          </div>
    
          <div className="form-group-admin-event">
            <label htmlFor="edit-event-date">Data i godzina</label><br />
            <input
              type="datetime-local"
              className="input-form-edit-event-detail-worker"
              id="edit-event-date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
 
          {userHA && userHA.housing_association_id && (
            <div className="form-group-admin-event">
              <label>Spółdzielnia</label><br />
              <div>
                {userHA.name ? `${userHA.name} (${userHA.city})` : "Brak danych"}
              </div>
              <input
                type="hidden"
                id="housing_association_id"
                value={userHA.housing_association_id}
              />
            </div>
          )}
          <div className="modal-buttons-edit-event-detail-worker">
            <Button 
              id="edit-event-accept-button-worker"
              type="submit"
              variant="contained"
              className="save-button"
            >
              Zapisz
            </Button>
            <Button 
              id="edit-event-accept-button-worker"
              variant="contained"
              onClick={handleClose}
              className="cancel-button"
            >
              Anuluj
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};
