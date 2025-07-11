import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import config from "../../../config";
import { Footer } from "../../Footer/Footer";
import "./BrowseYourReportsResidentStyle.css";
import { getUserRole } from "../../../getUserRole";
import { NavbarResident } from "../NavbarResident/NavbarResident";
import { DeleteReportConfirmationModalResident } from "../DeleteReportConfirmationModalResident/DeleteReportConfirmationModalResident";
import { EditReportModalResident } from "../EditReportModalResident/EditReportModalResident";

export const BrowseYourReportsResident = () => {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;
  const token = localStorage.getItem("token");
  const { role } = getUserRole();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${config.BASE_URL}/get-my-reports`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
      if (!response.ok) {
        toast.error("Błąd przy pobieraniu zgłoszeń");
        return;
      }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Błąd przy pobieraniu zgłoszeń:", error);
      toast.error("Wystąpił błąd przy pobieraniu zgłoszeń");
    }
  };

  useEffect(() => {
    if (token && role) {
      fetchReports();
    }
  }, [token, role]);

  const indexOfLast = currentPage * reportsPerPage;
  const indexOfFirst = indexOfLast - reportsPerPage;
  const currentReports = reports.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = (report) => {
    setDeletingReportId(report.report_id);
    setIsDeleteModalOpen(true);
  };

  const handleReportDeleted = () => {
    setReports((prevReports) =>
      prevReports.filter((report) => report.report_id !== deletingReportId)
    );
    setIsDeleteModalOpen(false);
    setDeletingReportId(null);
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedReport) => {
    setReports((prevReports) =>
      prevReports.map((r) =>
        r.report_id === updatedReport.report_id ? updatedReport : r
      )
    );
    setIsEditModalOpen(false);
    setEditingReport(null);
  };

  const statusMap = {
    to_do: "do zrobienia",
    in_progress: "w trakcie realizacji",
    done: "zrobione"
  };

  const ReportCard = ({ report }) => (
    <div className="report-association-card-resident">
      <h3>{report.title}</h3>
      <p>
        <strong>Opis:</strong> {report.description} <br />
        <strong>Status:</strong> {statusMap[report.status] || report.status} <br />
        <strong>Data zgłoszenia:</strong>{" "}
        {report.created_at ? new Date(report.created_at).toLocaleString() : ""} <br />
        <strong>Spółdzielnia:</strong> {report.housing_association_name}
      </p>
      <div className="report-button-row-resident">
        <button
          onClick={() => handleEdit(report)}
          className="button-browse-reports-resident"
        >
          Edytuj
        </button>
        <button
          onClick={() => handleDelete(report)}
          className="button-browse-reports-resident"
        >
          Usuń
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isDeleteModalOpen && (
        <DeleteReportConfirmationModalResident
          open={isDeleteModalOpen}
          handleClose={() => {
            setIsDeleteModalOpen(false);
          }}
          reportId={deletingReportId}
          message="Czy jesteś pewien, że chcesz usunąć to zgłoszenie?"
          onDeleteSuccess={handleReportDeleted}
        />
      )}

      {isEditModalOpen && editingReport && (
        <EditReportModalResident
          isOpen={isEditModalOpen}
          handleClose={() => {
            setIsEditModalOpen(false);
            setEditingReport(null);
          }}
          report={editingReport}
          onSave={handleEditSuccess}
        />
      )}

      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarResident />
        </div>
        <div className="start-window-admin-content">
          <div className="browse-your-reports-section-resident">
            <div className="browse-reports-edit-section-resident">
              <h2>Przeglądanie zgłoszeń</h2>
              <div className="browse-reports-grid-resident">
                <div className="browse-reports-grid-resident-container">
                  {currentReports.length === 0 ? (
                    <p>Brak zgłoszeń do wyświetlenia</p>
                  ) : (
                    currentReports.map((report) => (
                      <ReportCard key={report.report_id} report={report} />
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="pagination-browse-reports-resident-grid">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((number) => (
                <button
                  id="number-of-pagination-browse-reports-grid-resident"
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
        <div className="footer-start-window-admin">
          <Footer />
        </div>
      </div>
    </>
  );
};
