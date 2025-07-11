import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarWorker } from "../NavbarWorker/NavbarWorker";
import { Footer } from "../../Footer/Footer";
import "./BrowseReportsWorkerStyle.css";
import { getUserRole } from "../../../getUserRole";

export const BrowseReportsWorker = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;
  const [reports, setReports] = useState([]);
  const [housingAssociation, setHousingAssociation] = useState(null);
  const { role } = getUserRole();
  const token = localStorage.getItem("token");

  const indexOfLast = currentPage * reportsPerPage;
  const indexOfFirst = indexOfLast - reportsPerPage;
  const currentReports = reports.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    const fetchHousingAssociation = async () => {
      try {
        const response = await fetch(
          `${config.BASE_URL}/what-is-my-housing-association`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.housing_association) {
            setHousingAssociation(data.housing_association);
          } else {
            setHousingAssociation(null);
            toast.info(data.message);
          }
        } else {
          toast.error("Błąd przy pobieraniu spółdzielni reklamowej");
        }
      } catch (error) {
        console.error("Błąd przy pobieraniu spółdzielni:", error);
        toast.error("Wystąpił błąd przy pobieraniu spółdzielni");
      }
    };

    if (
      token &&
      (role === "administrator" ||
        role === "resident" ||
        role === "worker")
    ) {
      fetchHousingAssociation();
    }
  }, [token, role]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const endpoint = `${config.BASE_URL}/get-reports/${housingAssociation.housing_association_id}`;
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        } else {
          toast.error("Błąd przy pobieraniu zgłoszeń");
        }
      } catch (error) {
        console.error("Błąd przy pobieraniu zgłoszeń:", error);
        toast.error("Wystąpił błąd przy pobieraniu zgłoszeń");
      }
    };

    if (token && housingAssociation && housingAssociation.housing_association_id) {
      fetchReports();
    }
  }, [token, housingAssociation]);

  const ReportCard = ({ report }) => {
    const [status, setStatus] = useState(report.status);

    const handleStatusChange = async (e) => {
      const newStatus = e.target.value;
      setStatus(newStatus);
      const is_it_done = newStatus === "zrobione";
      try {
        const response = await fetch(
          `${config.BASE_URL}/update-report-status/${report.report_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ status: newStatus, is_it_done }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message || "Status zgłoszenia zmieniony pomyślnie.");
        } else {
          toast.error(data.error || "Błąd przy zmianie statusu zgłoszenia.");
        }
      } catch (error) {
        console.error("Błąd przy zmianie statusu zgłoszenia:", error);
        toast.error("Wystąpił błąd przy zmianie statusu zgłoszenia.");
      }
    };

    return (
      <div className="browse-reports-worker-card">
        <h3>{report.title}</h3>
        <p>
          <strong>Opis:</strong> {report.description} <br />
          <strong>Status:</strong>{" "}
          <select value={status} onChange={handleStatusChange}>
            <option value="do wykonania">do wykonania</option>
            <option value="w trakcie realizacji">w trakcie realizacji</option>
            <option value="zrobione">zrobione</option>
          </select>
          <br />
          <strong>Data zgłoszenia:</strong>{" "}
          {report.created_at ? new Date(report.created_at).toLocaleString() : ""} <br />
          <strong>Spółdzielnia:</strong> {report.housing_association_name} <br />
          <strong>Zamieścił:</strong> {report.first_name} {report.surname} <br />
          <strong>Mieszka:</strong> {report.street}, {report.building_number}
          {report.apartment_number ? "/" + report.apartment_number : ""}
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarWorker />
        </div>
        <div className="start-window-admin-content">
          <div className="browse-reports-section-worker">
            <div className="browse-reports-edit-section-worker">
              <h2>Przeglądanie zgłoszeń</h2>
              <div className="browse-reports-grid-worker">
                <div className="browse-reports-grid-worker-container">
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
            <div className="pagination-browse-reports-worker-grid">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((number) => (
                <button
                  id="number-of-pagination-browse-reports-grid-worker"
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
      <div className="footer-start-window-admin">
        <Footer />
      </div>
    </>
  );
};
