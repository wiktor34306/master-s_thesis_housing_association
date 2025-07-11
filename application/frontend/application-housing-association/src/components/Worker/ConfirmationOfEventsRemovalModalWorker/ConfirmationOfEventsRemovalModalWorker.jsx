import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import config from '../../../config';
import './ConfirmationOfEventsRemovalModalWorkerStyle.css';

export const ConfirmationOfEventsRemovalModalWorker = ({ 
  isOpen, 
  handleClose, 
  eventId, 
  onDeleteSuccess 
}) => {

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${config.BASE_URL}/event/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Wydarzenie usunięte pomyślnie.");
        handleClose();
        if (onDeleteSuccess) {
          onDeleteSuccess(); 
        }
      } else {
        console.error("Błąd przy usuwaniu wydarzenia:", data);
        toast.error(data.error || "Błąd przy usuwaniu wydarzenia.");
      }
    } catch (error) {
      console.error("Błąd przy usuwaniu wydarzenia:", error);
      toast.error("Wystąpił błąd przy usuwaniu wydarzenia.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="confirm-delete-event-title"
      aria-describedby="confirm-delete-event-description"
    >
      <Box className="confirm-delete-event-worker-modal">
        <h2 id="confirm-delete-event-title">
          Czy na pewno chcesz usunąć to wydarzenie?
        </h2>
        <div className="confirmation-buttons-event-removal-worker">
          <Button
            id="confirm-yes-button-remove-event-worker"
            variant="contained"
            color="primary"
            onClick={handleConfirmDelete}
          >
            Tak
          </Button>
          <Button
            id="confirm-yes-button-remove-event-worker"
            variant="contained"
            color="secondary"
            onClick={handleClose}
          >
            Anuluj
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
