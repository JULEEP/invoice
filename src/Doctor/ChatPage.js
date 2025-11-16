import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import moment from "moment";
import { FaPaperPlane, FaArrowLeft, FaFileUpload, FaFilePdf, FaFileImage, FaFileAlt } from "react-icons/fa";
import { FiX } from "react-icons/fi";

const ChatPage = () => {
  const { staffId, doctorId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [staffName, setStaffName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("https://api.credenthealth.com", {
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  // Fetch messages with auto-refresh every 2 seconds
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `https://api.credenthealth.com/api/staff/getchat/${staffId}/${doctorId}`
      );
      setMessages(response.data.messages || []);
      // Set staff name from the first message if available
      if (response.data.messages && response.data.messages.length > 0) {
        const firstMessage = response.data.messages[0];
        if (firstMessage.senderId === staffId) {
          setStaffName(firstMessage.sender);
        } else if (firstMessage.receiverId === staffId) {
          setStaffName(firstMessage.receiver);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  };

  // Set up socket listeners and initial fetch
  useEffect(() => {
    if (!socket || !staffId || !doctorId) return;

    // Initial fetch
    fetchMessages();

    // Set up auto-refresh every 2 seconds
    const interval = setInterval(fetchMessages, 2000);
    setRefreshInterval(interval);

    // Join the chat room
    const roomId = `${staffId}_${doctorId}`;
    socket.emit("joinRoom", roomId);

    // Set up message listener
    socket.on("receiveMessage", (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off("receiveMessage");
      clearInterval(interval);
    };
  }, [socket, staffId, doctorId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
  if (!newMessage.trim() && !selectedFile) return;

  try {
    const formData = new FormData();
    formData.append("senderType", "doctor");  // or whatever applies in your use case
    if (newMessage.trim()) formData.append("message", newMessage.trim());
    if (selectedFile) formData.append("file", selectedFile);

    setIsUploading(true);

    const response = await axios.post(
      `https://api.credenthealth.com/api/staff/sendchat/${staffId}/${doctorId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success) {
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Optionally update messages from response or fetch again
      setMessages(prev => [...prev, response.data.chat]);
    }
  } catch (error) {
    console.error("❌ Failed to send message:", error.response?.data || error.message);
  } finally {
    setIsUploading(false);
  }
};

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        `https://api.credenthealth.com/api/staff/uploadchatfile/${staffId}/${doctorId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.message) {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return <FaFilePdf className="text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return <FaFileImage className="text-blue-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">
          Chat with {staffName}
        </h1>
      </div>
      
      <div className="h-[60vh] overflow-y-auto mb-4 space-y-3 p-4 bg-gray-50 rounded-lg">
        {isLoading ? (
          <div className="text-center py-4">Loading chat history...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No messages yet</div>
        ) : (
          messages.map((msg, index) => {
            const isDoctor = msg.senderId === doctorId;
            const alignment = isDoctor ? 'items-end' : 'items-start';
            const bubbleColor = isDoctor ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800';
            const senderLabel = isDoctor ? "You" : (msg.sender || staffName);

            return (
              <div key={index} className={`flex flex-col ${alignment}`}>
                <div className="text-xs text-gray-500 mb-1">
                  {senderLabel} • {moment(msg.timestamp).format('hh:mm A')}
                </div>
                {msg.file ? (
                  <a 
                    href={`https://api.credenthealth.com${msg.file}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${bubbleColor} flex items-center gap-2`}
                  >
                    {getFileIcon(msg.file)}
                    <span>File Attachment</span>
                  </a>
                ) : (
                  <div className={`max-w-[80%] px-4 py-2 rounded-lg ${bubbleColor}`}>
                    {msg.message}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col gap-2">
        {selectedFile && (
          <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
            <div className="flex items-center gap-2">
              {getFileIcon(selectedFile.name)}
              <span className="text-sm truncate max-w-xs">{selectedFile.name}</span>
            </div>
            <button 
              onClick={() => setSelectedFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              <FiX />
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
            title="Upload file"
          >
            <FaFileUpload />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.gif"
          />
          
          <input
            type="text"
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message or upload file..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          
          <button
            onClick={handleSendMessage}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:bg-blue-300"
            disabled={(!newMessage.trim() && !selectedFile) || isUploading}
          >
            {isUploading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;