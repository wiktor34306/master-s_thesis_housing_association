import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import config from '../../../config';
import './DeleteReportConfirmationModalResidentStyle.css';

export const DeleteReportConfirmationModalResident = ({ 
  open, 
  handleClose, 
  reportId, 
  onDeleteSuccess, 
  message 
}) => {
  
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${config.BASE_URL}/delete-report/${reportId}`,
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
        toast.success(data.message || "Zgłoszenie usunięte pomyślnie.");
        handleClose();
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        console.error("Błąd przy usuwaniu zgłoszenia (modal):", data);
        toast.error(data.error || "Błąd przy usuwaniu zgłoszenia.");
      }
    } catch (error) {
      console.error("Błąd przy usuwaniu zgłoszenia (modal):", error);
      toast.error("Wystąpił błąd przy usuwaniu zgłoszenia.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="confirm-delete-report-title"
      aria-describedby="confirm-delete-report-description"
    >
      <Box className="confirm-delete-report-modal-resident">
        <h2 id="confirm-delete-report-title">{message}</h2>
        <div className="confirmation-buttons-report-removal-resident">
          <Button
            id="confirm-yes-button-remove-report-resident"
            variant="contained"
            color="primary"
            onClick={handleConfirmDelete}
          >
            Tak
          </Button>
          <Button
            id="confirm-yes-button-remove-report-resident"
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
