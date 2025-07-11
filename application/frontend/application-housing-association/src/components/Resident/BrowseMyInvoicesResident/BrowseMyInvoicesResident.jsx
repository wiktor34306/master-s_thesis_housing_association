import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarResident } from "../NavbarResident/NavbarResident";
import { Footer } from "../../Footer/Footer";
import "./BrowseMyInvoicesResidentStyle.css";
import { getUserRole } from "../../../getUserRole";
import { HiArrowDownTray } from "react-icons/hi2";

export const BrowseMyInvoicesResident = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 10;
  const [invoices, setInvoices] = useState([]);
  const { role } = getUserRole();
  const token = localStorage.getItem("token");

  const indexOfLast = currentPage * invoicesPerPage;
  const indexOfFirst = indexOfLast - invoicesPerPage;
  const currentInvoices = invoices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(invoices.length / invoicesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDownloadDocument = (documentId, documentName) => {
    const downloadUrl = `${config.BASE_URL}/fetch-pdf?documentId=${documentId}`;
    fetch(downloadUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Nie udało się pobrać pliku, status: " + response.status);
        }
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      })
      .catch((err) => {
        console.error("frontend-browseinvoices [ERROR] Błąd pobierania dokumentu:", err);
        toast.error("Błąd pobierania faktury.");
      });
  };

  useEffect(() => {
    if (!token) {
      console.error("frontend-browseinvoices [ERROR] Brak tokena!");
      return;
    }
    fetch(`${config.BASE_URL}/get-invoices-by-user-id`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setInvoices(data);
      })
      .catch((err) => {
        console.error("frontend-browseinvoices [ERROR] Błąd podczas pobierania faktur:", err);
        toast.error("Błąd pobierania faktur.");
      });
  }, [token]);

  const InvoiceCard = ({ invoice }) => {
    return (
      <div className="browse-invoices-resident-card">
        <h3>{invoice.name}</h3>
        <p>
          <strong>Data wystawienia:</strong>{" "}
          {invoice.date_of_creation
            ? new Date(invoice.date_of_creation).toLocaleString()
            : ""}
          <br />
          <strong>Przeznaczona dla:</strong> {invoice.first_name} {invoice.surname}
        </p>
        <div className="invoices-button-row-resident">
          <button
            className="button-browse-invoices-resident"
            onClick={() => handleDownloadDocument(invoice.document_id, invoice.name)}
          >
            <HiArrowDownTray /> Przeglądaj fakturę
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarResident />
        </div>
        <div className="start-window-admin-content">
          <div className="browse-invoices-section-resident">
            <div className="browse-invoices-edit-section-resident">
              <h2>Przeglądanie faktur</h2>
              <div className="browse-invoices-grid-resident">
                <div className="browse-invoices-grid-resident-container">
                  {currentInvoices.length === 0 ? (
                    <p>Brak faktur do wyświetlenia</p>
                  ) : (
                    currentInvoices.map((invoice) => (
                      <InvoiceCard key={invoice.document_id} invoice={invoice} />
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="pagination-browse-invoices-resident-grid">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((number) => (
                <button
                  id="number-of-pagination-browse-invoices-grid-resident"
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

