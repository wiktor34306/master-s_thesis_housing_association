import { useState, useEffect } from "react";
import { NavbarAdmin } from "../NavbarAdmin/NavbarAdmin";
import { Footer } from "../../Footer/Footer";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import config from "../../../config";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import "./BrowseEventsAdminStyle.css";
import { ConfirmationOfEventsRemovalModalAdmin } from "../ConfirmationOfEventsRemovalModalAdmin/ConfirmationOfEventsRemovalModalAdmin";
import { EditEventFormModalAdmin } from "../EditEventFormModalAdmin/EditEventFormModalAdmin";

export const BrowseEventsAdmin = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [userHA, setUserHA] = useState(null);
  const [loadingHA, setLoadingHA] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState(null);

  const role = JSON.parse(localStorage.getItem("userRole"))?.role || "administrator";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      console.error("[useEffect-myHA] Brak tokena!");
      setLoadingHA(false);
      return;
    }
    fetch(`${config.BASE_URL}/my-housing-association`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data && data.error) {
          console.warn("[my-housing-association] Otrzymano error:", data.error);
          setUserHA({ housing_association_id: null });
        } else if (data) {
          if (Array.isArray(data)) {
            setUserHA(data[0]);
          } else {
            setUserHA(data);
          }
        } else {
        }
        setLoadingHA(false);
      })
      .catch((error) => {
        console.error("[my-housing-association] Błąd:", error);
        setLoadingHA(false);
      });
  }, [token]);

  useEffect(() => {
    if (userHA) {
      if (userHA.name) {
      } else {
      }
    } else {
    }
  }, [userHA]);

  useEffect(() => {
    if (!token) {
      console.error("[useEffect-fetchEvents] Brak tokena");
      return;
    }

    let url = "";
    if (role === "administrator" && userHA && userHA.housing_association_id) {
      url = `${config.BASE_URL}/get-events/${userHA.housing_association_id}`;
    } else {
      url = `${config.BASE_URL}/get-all-events`;
    }
    
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        setEvents(data);
      })
      .catch(error => {
        console.error("[useEffect-fetchEvents] Błąd przy pobieraniu wydarzeń:", error);
        toast.error("Błąd przy pobieraniu wydarzeń.");
      });
  }, [token, role, userHA]);

  const formatDatePart = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getEventsForDay = (day) => {
    const formattedDay = formatDatePart(day);
    const filtered = events.filter((event) => {
      const eventDateObj = new Date(event.event_date);
      const formattedEventDate = formatDatePart(eventDateObj);
      return formattedDay === formattedEventDate;
    });
    return filtered;
  };

  const filteredEvents = getEventsForDay(date).sort(
    (a, b) => new Date(a.event_date) - new Date(b.event_date)
  );

  const tileContent = ({ date: tileDate, view }) => {
    if (view === "month") {
      const dayEvents = getEventsForDay(tileDate);
      if (dayEvents.length > 0) {
        return <div className="event-marker"></div>;
      }
    }
    return null;
  };

  const handleDayClick = (selectedDate) => {
    setDate(selectedDate);
    const eventsForDay = getEventsForDay(selectedDate);
  };

  const handleOpenDeleteModal = (eventId) => {
    setSelectedEventId(eventId);
    setIsDeleteModalOpen(true);
  };

  const handleOpenEditModal = (eventData) => {
    setSelectedEventData(eventData);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEventData(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedEventId(null);
  };

  const refreshEvents = () => {
    if (!token) return;
    let url = "";
    if (
      role === "administrator" &&
      userHA &&
      userHA.housing_association_id
    ) {
      url = `${config.BASE_URL}/get-events/${userHA.housing_association_id}`;
    } else {
      url = `${config.BASE_URL}/get-all-events`;
    }
    
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then(response => response.json())
      .then(data => {
        setEvents(data);
      })
      .catch(error => {
        console.error("Błąd przy odświeżaniu wydarzeń:", error);
        toast.error("Błąd przy odświeżaniu wydarzeń.");
      });
  };

  return (
    <>
      <ConfirmationOfEventsRemovalModalAdmin
        isOpen={isDeleteModalOpen}
        handleClose={handleCloseDeleteModal}
        eventId={selectedEventId}
        onDeleteSuccess={refreshEvents}
      />
      
      <EditEventFormModalAdmin
        isOpen={isEditModalOpen}
        handleClose={handleCloseEditModal}
        eventData={selectedEventData}
        onSave={refreshEvents}
        userHA={userHA}
      />

      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarAdmin />
        </div>
        <div className="start-window-admin-content">
          {userHA ? (
            <div className="housing-association-info">
            </div>
          ) : (
            console.log("Brak danych spółdzielni podczas renderowania")
          )}
          <div className="browse-events-section-admin">
            <div className="browse-events-admin-section">
              <h2>Kalendarz wydarzeń</h2>
              <div className="calendar-container-admin">
                <Calendar
                  onChange={handleDayClick}
                  value={date}
                  tileContent={tileContent}
                />
              </div>
              <div className="events-list-section-admin">
                <h3>Lista wydarzeń dla dnia {date.toLocaleDateString()}</h3>
                {filteredEvents.length === 0 ? (
                  <p>Brak wydarzeń do wyświetlenia.</p>
                ) : (
                  filteredEvents.map((event) => (
                    <div key={event.event_id || event.id} className="event-item-admin">
                      <p>
                        <strong>Tytuł:</strong> {event.title}
                      </p>
                      <p>
                        <strong>Opis:</strong> {event.description}
                      </p>
                      <p>
                        <strong>Godzina:</strong>{" "}
                        {new Date(event.event_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p>
                        <strong>Spółdzielnia:</strong> {event.housing_association_name}
                      </p>
                      <div className="event-actions-admin">
                        <button
                          className="button-browse-events-admin"
                          onClick={() => handleOpenEditModal(event)}
                        >
                          <FaEdit color="white" size={20} />
                        </button>
                        <button
                          className="button-browse-events-admin"
                          onClick={() => handleOpenDeleteModal(event.event_id || event.id)}
                        >
                          <MdDeleteForever color="white" size={24} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
