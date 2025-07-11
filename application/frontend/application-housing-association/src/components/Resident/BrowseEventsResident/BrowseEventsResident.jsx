import { useState, useEffect } from "react";
import { Footer } from "../../Footer/Footer";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import config from "../../../config";
import { toast } from "react-toastify";
import { NavbarResident } from "../NavbarResident/NavbarResident";
import "./BrowseEventsResidentStyle.css";

export const BrowseEventsResident = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [userHA, setUserHA] = useState(null);
  const [loadingHA, setLoadingHA] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      console.error("Brak tokena!");
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
          console.warn("Otrzymano error:", data.error);
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
        console.error("Błąd:", error);
        setLoadingHA(false);
      });
  }, [token]);

  useEffect(() => {
    if (!token) {
      console.error("Brak tokena");
      return;
    }
    if (userHA && userHA.housing_association_id) {
      const url = `${config.BASE_URL}/get-events/${userHA.housing_association_id}`;
      fetch(url, {
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
          setEvents(data);
        })
        .catch((error) => {
          console.error("Błąd przy pobieraniu wydarzeń:", error);
          toast.error("Błąd przy pobieraniu wydarzeń.");
        });
    }
  }, [token, userHA]);

  const formatDatePart = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getEventsForDay = (day) => {
    const formattedDay = formatDatePart(day);
    return events.filter((event) => {
      const eventDateObj = new Date(event.event_date);
      const formattedEventDate = formatDatePart(eventDateObj);
      return formattedDay === formattedEventDate;
    });
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

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarResident />
        </div>
        <div className="start-window-admin-content">
          <div className="browse-events-section-resident">
            <div className="browse-events-resident-section">
              <h2>Kalendarz wydarzeń</h2>
              <div className="calendar-container-resident">
                <Calendar
                  onChange={handleDayClick}
                  value={date}
                  tileContent={tileContent}
                />
              </div>
              <div className="events-list-section-resident">
                <h3>Lista wydarzeń dla dnia {date.toLocaleDateString()}</h3>
                {filteredEvents.length === 0 ? (
                  <p>Brak wydarzeń do wyświetlenia.</p>
                ) : (
                  filteredEvents.map((event) => (
                    <div key={event.event_id || event.id} className="event-item-resident">
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
