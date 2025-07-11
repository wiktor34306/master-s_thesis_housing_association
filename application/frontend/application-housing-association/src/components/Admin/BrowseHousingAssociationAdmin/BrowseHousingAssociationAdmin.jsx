import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarAdmin } from "../NavbarAdmin/NavbarAdmin";
import { Footer } from "../../Footer/Footer";
import "./BrowseHousingAssociationAdminStyle.css";
import { getUserRole } from "../../../getUserRole";
import { EditHousingAssociationDetailAdmin } from "../EditHousingAssociationDetailAdmin/EditHousingAssociationDetailAdmin";
import { ConfirmationOfHousingAssociationRemovalModalAdmin } from "../ConfirmationOfHousingAssociationRemovalModalAdmin/ConfirmationOfHousingAssociationRemovalModalAdmin";

export const BrowseHousingAssociationAdmin = () => {
  const [associations, setAssociations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const associationsPerPage = 10;
  const token = localStorage.getItem("token");
  const { role } = getUserRole();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAssociation, setEditingAssociation] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAssociationId, setDeletingAssociationId] = useState(null);

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        let response;
        if (role === "administrator") {
          response = await fetch(
            `${config.BASE_URL}/get-all-housing-associations`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );
          if (response.status === 200) {
            const data = await response.json();
            setAssociations(data);
            return;
          } else if (response.status === 403) {
            response = await fetch(
              `${config.BASE_URL}/my-housing-association`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + token,
                },
              }
            );
            if (!response.ok) {
              toast.error("Błąd przy pobieraniu spółdzielni");
              return;
            }
            const data = await response.json();
            setAssociations(data);
          } else {
            toast.error("Błąd przy pobieraniu spółdzielni");
          }
        } else {
          response = await fetch(
            `${config.BASE_URL}/my-housing-association`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );
          if (!response.ok) {
            toast.error("Błąd przy pobieraniu spółdzielni");
            return;
          }
          const data = await response.json();
          setAssociations(data);
        }
      } catch (error) {
        console.error("Błąd przy pobieraniu spółdzielni:", error);
        toast.error("Wystąpił błąd przy pobieraniu spółdzielni");
      }
    };

    if (token && role) {
      fetchAssociations();
    }
  }, [token, role]);

  const handleEdit = (association) => {
    setEditingAssociation({ ...association });
    setIsEditModalOpen(true);
  };

  const handleDelete = (association) => {
    setDeletingAssociationId(association.housing_association_id);
    setIsDeleteModalOpen(true);
  };

  const indexOfLast = currentPage * associationsPerPage;
  const indexOfFirst = indexOfLast - associationsPerPage;
  const currentAssociations = associations.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(associations.length / associationsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const AssociationCard = ({ association }) => (
    <div className="ha-association-card">
      <h3>{association.name}</h3>
      <p>
        <strong>Adres:</strong> {association.address}, {association.city} <br />
        <strong>Kod pocztowy:</strong> {association.postcode} <br />
        <strong>Telefon:</strong> {association.phone_number} <br />
        <strong>E-mail:</strong> {association.email_address}
      </p>
      <div className="association-button-row">
        <button onClick={() => handleEdit(association)} className="button-browse-ha-admin">
          Edytuj
        </button>
        <button onClick={() => handleDelete(association)} className="button-browse-ha-admin">
          Usuń
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarAdmin />
        </div>
        <div className="start-window-admin-content">
          <div className="browse-ha-section-admin">
            <div className="housing-association-edit-section">
              <h2>Przeglądanie spółdzielni</h2>
              <div className="browse-ha-grid-admin">
                <div className="browse-ha-grid-admin-container">
                  {currentAssociations.length === 0 ? (
                    <p>Brak spółdzielni do wyświetlenia</p>
                  ) : (
                    currentAssociations.map((assoc) => (
                      <AssociationCard
                        key={assoc.housing_association_id}
                        association={assoc}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="pagination-browse-ha-admin-grid">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((number) => (
                <button
                  id="number-of-pagination-browse-ha-grid-admin"
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`page-button ${number === currentPage ? "active" : ""}`}
                >
                  {number}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
   
      {isEditModalOpen && editingAssociation && (
        <EditHousingAssociationDetailAdmin
          isOpen={isEditModalOpen}
          handleClose={() => setIsEditModalOpen(false)}
          housingAssociation={editingAssociation}
          onSave={(updatedAssociation) => {
           
            setAssociations((prev) =>
              prev.map((assoc) =>
                assoc.housing_association_id === updatedAssociation.housing_association_id
                  ? updatedAssociation
                  : assoc
              )
            );
          }}
        />
      )}

      {isDeleteModalOpen && deletingAssociationId && (
        <ConfirmationOfHousingAssociationRemovalModalAdmin
          isOpen={isDeleteModalOpen}
          handleClose={() => setIsDeleteModalOpen(false)}
          housingAssociationId={deletingAssociationId}
          onDeleteSuccess={() => {
            setAssociations((prev) =>
              prev.filter(
                (assoc) => assoc.housing_association_id !== deletingAssociationId
              )
            );
          }}
        />
      )}

      <div className="footer-start-window-admin">
        <Footer />
      </div>
    </>
  );
};
