import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarAdmin } from "../NavbarAdmin/NavbarAdmin";
import { Footer } from "../../Footer/Footer";
import { CircularProgress } from "@mui/material";
import "./GenerateInvoicePdfAdminStyle.css";

export const GenerateInvoicePdfAdmin = () => {
  const navigate = useNavigate();

  const [invoiceDate, setInvoiceDate] = useState("");
  const [billingStartDate, setBillingStartDate] = useState("");
  const [billingEndDate, setBillingEndDate] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [utilitiesAmount, setUtilitiesAmount] = useState("");
  const [paymentDeadline, setPaymentDeadline] = useState("");
  const [serviceContactName, setServiceContactName] = useState("");
  const [serviceContactPhone, setServiceContactPhone] = useState("");
  const [serviceContactEmail, setServiceContactEmail] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedResident, setSelectedResident] = useState("");
  const [cooperativeData, setCooperativeData] = useState(null);
  const [residents, setResidents] = useState([]);
  const [creatorName, setCreatorName] = useState("");

  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const totalAmount = Number(rentAmount) + Number(utilitiesAmount);

  useEffect(() => {
    fetch(`${config.BASE_URL}/get-based-info-about-user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const userInfo = data[0];
          const roleMapping = {
            administrator: "administrator",
            worker: "pracownik spółdzielni",
            resident: "mieszkaniec",
          };
          const translatedRole = roleMapping[userInfo.role] || userInfo.role;
          const fullCreatorName = `${translatedRole} ${userInfo.first_name} ${userInfo.surname}`;
          setCreatorName(fullCreatorName);
        } else {
          setCreatorName("Brak danych");
        }
      })
      .catch((err) => {
        console.error("frontend-generatepdf [DEBUG] Error fetching user info:", err);
        setCreatorName("Brak danych");
      });
  }, []);

  useEffect(() => {
    fetch(`${config.BASE_URL}/what-is-my-housing-association`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.housing_association) {
          setCooperativeData(data.housing_association);
        } else {
          toast.info(data.message);
        }
      })
      .catch((err) => {
        console.error("frontend-generatepdf [DEBUG] Error fetching cooperative data:", err);
      });
  }, []);

  useEffect(() => {
    fetch(`${config.BASE_URL}/residents-by-user-id`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setResidents(data);
      })
      .catch((err) => {
        console.error("frontend-generatepdf [DEBUG] Error fetching residents data:", err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGeneratingInvoice(true);

    const formattedInvoiceDate = moment(invoiceDate).format("DD.MM.YYYY");
    const formattedBillingStartDate = moment(billingStartDate).format("DD.MM.YYYY");
    const formattedBillingEndDate = moment(billingEndDate).format("DD.MM.YYYY");
    const formattedPaymentDeadline = moment(paymentDeadline).format("DD.MM.YYYY");

    const formattedCooperativeAddress =
      cooperativeData
        ? `${cooperativeData.postcode} ${cooperativeData.city}, ul. ${cooperativeData.address}`
        : "";

    const dataForInvoice = {
      user_id: recipientId,
      invoiceDate: formattedInvoiceDate,
      billingStartDate: formattedBillingStartDate,
      billingEndDate: formattedBillingEndDate,
      rentAmount,
      utilitiesAmount,
      totalAmount,
      paymentDeadline: formattedPaymentDeadline,
      serviceContactName,
      serviceContactPhone,
      serviceContactEmail,
      recipientName,
      recipientAddress,
      cooperativeName: cooperativeData ? cooperativeData.name : "",
      cooperativeAddress: formattedCooperativeAddress,
      creatorName,
    };

    try {
      const response = await fetch(`${config.BASE_URL}/create-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ data: dataForInvoice }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Faktura została wygenerowana.");
        navigate("/browse-all-invoices-admin");
      } else {
        const errorText = await response.text();
        console.error("frontend-generatepdf [DEBUG] Error generating invoice:", errorText);
        toast.error("Błąd generowania faktury.");
      }
    } catch (error) {
      console.error("frontend-generatepdf [DEBUG] Error sending form data:", error);
      toast.error("Błąd generowania faktury.");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarAdmin />
        </div>

        <div className="start-window-admin-content">
          <div className="gi-form-section-admin">
            <div className="generate-invoice-form-section-admin">
              <h2>Generowanie faktury z opłatami</h2>
              <div className="form-generate-invoice-admin">
                <div className="form-gen-invoice-form-admin-container">
                  {isGeneratingInvoice ? (
                    <div className="loading-container">
                      <CircularProgress />
                      <p>Trwa generowanie faktury. Proszę czekać...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="add-ha-form">
                      <div className="form-group-invoice-admin">
                        <label htmlFor="date-issue">Data wystawienia</label>
                        <br />
                        <input
                          type="date"
                          className="input-gen-inv-form-admin"
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group-invoice-admin">
                        <label htmlFor="start-range">
                          Początek okresu rozliczeniowego
                        </label>
                        <br />
                        <input
                          type="date"
                          className="input-gen-inv-form-admin"
                          value={billingStartDate}
                          onChange={(e) => setBillingStartDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group-invoice-admin">
                        <label htmlFor="end-range">
                          Koniec okresu rozliczeniowego
                        </label>
                        <br />
                        <input
                          type="date"
                          className="input-gen-inv-form-admin"
                          value={billingEndDate}
                          onChange={(e) => setBillingEndDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group-invoice-admin">
                        <label htmlFor="rent">Czynsz (zł)</label>
                        <br />
                        <input
                          type="number"
                          className="input-gen-inv-form-admin"
                          value={rentAmount}
                          onChange={(e) => setRentAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group-invoice-admin">
                        <label htmlFor="utility-fees">Opłaty za media (zł)</label>
                        <br />
                        <input
                          type="number"
                          className="input-gen-inv-form-admin"
                          value={utilitiesAmount}
                          onChange={(e) => setUtilitiesAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group-invoice-admin">
                        <label htmlFor="maturity">Termin płatności</label>
                        <br />
                        <input
                          type="date"
                          className="input-gen-inv-form-admin"
                          value={paymentDeadline}
                          onChange={(e) => setPaymentDeadline(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group-invoice-admin">
                        <label htmlFor="name-of-worker">
                          Dane działu obsługi mieszkańców
                        </label>
                        <br />
                        <input
                          type="text"
                          className="input-gen-inv-form-admin"
                          placeholder="Imię i nazwisko pracownika"
                          value={serviceContactName}
                          onChange={(e) => setServiceContactName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group-invoice-admin">
                        <input
                          type="text"
                          className="input-gen-inv-form-admin"
                          placeholder="Telefon"
                          value={serviceContactPhone}
                          onChange={(e) => setServiceContactPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group-invoice-admin">
                        <input
                          type="email"
                          className="input-gen-inv-form-admin"
                          placeholder="Email"
                          value={serviceContactEmail}
                          onChange={(e) => setServiceContactEmail(e.target.value)}
                        />
                      </div>

                      <div className="form-group-invoice-admin">
                        <label htmlFor="recipient">Odbiorca faktury</label>
                        <br />
                        <select
                          value={selectedResident}
                          className="input-gen-inv-form-admin"
                          onChange={(e) => {
                            setSelectedResident(e.target.value);
                            if (e.target.value) {
                              const selectedOption = JSON.parse(e.target.value);
                              setRecipientId(selectedOption.user_id);
                              setRecipientName(
                                `${selectedOption.first_name} ${selectedOption.surname}`
                              );
                              const cleanStreet = selectedOption.street.replace(
                                /,$/,
                                ""
                              ).trim();
                              const finalAddress = `ul. ${cleanStreet} ${selectedOption.building_number}${
                                selectedOption.apartment_number
                                  ? "/" + selectedOption.apartment_number
                                  : ""
                              }`;
                              setRecipientAddress(finalAddress);
                            } else {
                              setRecipientId("");
                              setRecipientName("");
                              setRecipientAddress("");
                            }
                          }}
                          required
                        >
                          <option value="">Wybierz odbiorcę</option>
                          {residents.map((resident) => (
                            <option
                              key={resident.user_id}
                              value={JSON.stringify(resident)}
                            >
                              {`${resident.first_name} ${resident.surname}, ul. ${resident.street} ${resident.building_number}${
                                resident.apartment_number
                                  ? "/" + resident.apartment_number
                                  : ""
                              }`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group-invoice-admin">
                        {cooperativeData && (
                          <div className="form-group">
                            <label>Spółdzielnia</label>
                            <div>
                              {cooperativeData.name} ({cooperativeData.city})
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="form-actions-ha-admin">
                        <button
                          type="submit"
                          className="submit-button-form-inv-admin"
                        >
                          Generuj fakturę
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
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
