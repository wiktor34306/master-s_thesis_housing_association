import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import config from '../../../config';
import { getUserId } from '../../../getUserId';

export const NotificationToastResident = () => {
  const token = localStorage.getItem("token");
  const user_id = getUserId(); 
  
  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`${config.BASE_URL}/mark-notification-read/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
    } catch (error) {
      console.error("Błąd przy oznaczaniu powiadomienia jako odczytane:", error);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/get-notifications/${user_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });
        if (response.ok) {
          const notifications = await response.json();
          notifications.forEach(notif => {
            if (!notif.is_read) {
              toast.info(notif.message, {
                autoClose: 5000,
                onClose: () => {
                  markNotificationAsRead(notif.notification_id);
                }
              });
            }
          });
        } else {
          console.error("Błąd przy pobieraniu powiadomień, status:", response.status);
        }
      } catch (error) {
        console.error("Wystąpił błąd przy pobieraniu powiadomień:", error);
      }
    };

    if (token && user_id) {
      fetchNotifications();
    } else {
    }
  }, [token, user_id]);

  return null;
};

