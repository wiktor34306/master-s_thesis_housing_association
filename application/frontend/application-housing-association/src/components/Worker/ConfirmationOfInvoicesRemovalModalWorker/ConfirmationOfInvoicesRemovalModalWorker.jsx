import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import config from '../../../config';
import "./ConfirmationOfInvoicesRemovalModalWorkerStyle.css";

export const ConfirmationOfInvoicesRemovalModalWorker = ({ 
  isOpen, 
  handleClose, 
  documentId, 
  onDeleteSuccess 
}) => {

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${config.BASE_URL}/delete-invoice/${documentId}`,
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
        toast.success(data.message || "Faktura usunięta pomyślnie.");
        handleClose();
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        console.error("Błąd przy usuwaniu faktury:", data);
        toast.error(data.error || "Błąd przy usuwaniu faktury.");
      }
    } catch (error) {
      console.error("Błąd przy usuwaniu faktury:", error);
      toast.error("Wystąpił błąd przy usuwaniu faktury.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="confirm-delete-invoice-title"
      aria-describedby="confirm-delete-invoice-description"
    >
      <Box className="confirm-delete-invoices-worker-modal">
        <h2 id="confirm-delete-invoice-title">
          Czy na pewno chcesz usunąć tę fakturę?
        </h2>
        <div className="confirmation-buttons-invoices-removal-worker">
          <Button
            id="confirm-yes-button-remove-invoice-worker"
            variant="contained"
            color="primary"
            onClick={handleConfirmDelete}
          >
            Tak
          </Button>
          <Button
            id="confirm-yes-button-remove-invoice-worker"
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
