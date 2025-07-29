import { useState, useEffect, useCallback } from 'react';

export const useChannelMessages = (channelId, enabled = true) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!channelId) {
      setMessages([]); // Clear messages if no channel is selected
      return;
    }
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/channels/${channelId}/messages?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  // Function to append a new message received via socket
  const appendNewMessage = useCallback((newMessage) => {
    setMessages((prevMessages) => {
      // Prevent duplicate messages if the backend sends the message twice
      // (e.g., once on receive_message and once on message_sent for the sender)
      const isDuplicate = prevMessages.some(msg => msg.id === newMessage.id);
      if (isDuplicate) {
        return prevMessages;
      }
      return [...prevMessages, newMessage];
    });
  }, []);

  // auto-fetch when channelId changes (if enabled)
  useEffect(() => {
    if (enabled) {
      fetchMessages();
    } else {
      setMessages([]); // Clear messages if disabled (e.g., no active channel)
    }
  }, [fetchMessages, enabled]);

  // Return the new appendNewMessage function along with existing values
  return { messages, loading, error, refresh: fetchMessages, appendNewMessage };
};