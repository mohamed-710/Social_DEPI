import { useState, useEffect, useRef } from "react";
import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions"; // Emoji icon
import EmojiPicker from "emoji-picker-react"; // Emoji picker library
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setMessages, addMessage, deleteMessage } from "../state/index";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const MessageSidebar = ({ selectedFriend, handleClose, userId }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const messages = useSelector((state) => state.messages);
  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for scrolling to the last message

  // State for the delete menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  // Function to send a message
  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        sender: userId,
        receiver: selectedFriend._id,
        text: message,
      };

      try {
        const response = await axios.post(
          "http://localhost:3001/messages/send",
          newMessage,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        dispatch(addMessage(response.data.message));
        setMessage("");
        setIsDialogOpen(true);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // Function to fetch messages
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/messages/${userId}/${selectedFriend._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fetchedMessages = response.data.messages;
      dispatch(setMessages({ fetchedMessages }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`http://localhost:3001/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(deleteMessage(messageId));
      setAnchorEl(null); // Close the menu after deletion
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleMenuClick = (event, messageId) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessageId(null);
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedFriend]);

  useEffect(() => {
    // Scroll to the last message whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  // Close emoji picker on click outside the box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        right: 0,
        top: 1,
        bottom: 1,
        width: { xs: "100vw", md: "400px" },
        height: "100vh", // Make sidebar full height
        backgroundColor: "#00000080",
        backdropFilter: "blur(10px)",
        color: "white",
        boxShadow: "-20px 10px 10px rgba(0, 0, 0, 0.3)",
        padding: "1rem",
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{
          color: "#FFFFFF",
          position: "absolute",
          top: "1rem",
          right: "1rem",
        }}
      >
        <CloseIcon />
      </IconButton>

      <Typography
        variant="h6"
        fontWeight="500"
        mb="1.5rem"
        sx={{ color: "#F0F0F0" }}
      >
        Chat with {selectedFriend?.name}
      </Typography>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto", // Only the messages container should scroll
          padding: "0.77rem",
          backgroundColor: "transparent",
          borderRadius: "8px",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#0A0A0A",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#0A0A0A",
          },
        }}
      >
        {!messages || messages.length === 0 ? (
          <Typography variant="body2" sx={{ color: "#888888" }}>
            No messages yet.
          </Typography>
        ) : (
          messages.map((message) => (
            <Box
              key={message._id}
              sx={{
                mb: "0.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems:
                  message.sender === userId ? "flex-end" : "flex-start",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  color: "#B0B0B0",
                  marginBottom: "0.2rem",
                }}
              >
                {message.sender === userId ? "You" : selectedFriend.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    message.sender === userId ? "flex-end" : "flex-start",
                  width: "100%",
                  marginBottom: "1rem",
                }}
              >
                {message.sender === userId && (
                  <IconButton
                    onClick={(event) => handleMenuClick(event, message._id)}
                  >
                    <MoreHorizIcon />
                    {/* تأكد من ضبط العرض والارتفاع للأيقونة */}
                  </IconButton>
                )}

                <Box
                  sx={{
                    flexGrow: 1,
                    maxWidth: "60%",
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      message.sender === userId ? "#E0E0E0" : "#3C3C3C",
                    color: message.sender === userId ? "#1E1E1E" : "#ffff",
                    borderRadius:
                      message.sender === userId
                        ? "10px 10px 0px 10px"
                        : "10px 10px 10px 0px",
                    wordWrap: "break-word",
                    direction: /[\u0600-\u06FF]/.test(message.text)
                      ? "rtl"
                      : "ltr",
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#B0B0B0", display: "block" }}
                  >
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))
        )}
        {/* This box is for scrolling */}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "0rem",
          bgcolor: "#333333",
          borderRadius: "5px",
        }}
      >
        <IconButton
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          sx={{ color: "#FFFFFF" }}
        >
          <EmojiEmotionsIcon />
        </IconButton>

        {showEmojiPicker && (
          <Box
            sx={{
              position: "absolute",
              bottom: "60px",
              right: "10px",
              zIndex: 1300,
            }}
            ref={emojiPickerRef}
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </Box>
        )}

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          style={{
            flexGrow: 1,
            padding: "0.5rem",
            border: "none",
            borderRadius: "5px",
            marginLeft: "0.5rem",
            backgroundColor: "transparent",
            color: "#FFFFFF",
            outline: "none",
          }}
          placeholder="Type a message..."
        />

        <IconButton
          onClick={handleSendMessage}
          disabled={!message}
          sx={{
            color: message ? "#FFFFFF" : "gray",
            borderRadius: "0 5px 5px 0",
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>

      {/* Menu for deleting messages */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            margin: "8px",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleDeleteMessage(selectedMessageId);
            handleMenuClose();
          }}
        >
          Delete Message
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MessageSidebar;
