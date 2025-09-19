import React, { useEffect, useRef, useState } from "react";
import { MdSend } from "react-icons/md";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { backend_url } from "../services/AxiosHelper";
import { timeAgo } from "../services/TimeHelper";
import useChatContext from "../context/ChatContext";
import { getMessages } from "../services/RoomServices";

const ChatBox = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();

  // Redirect to home if not connected
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser, navigate]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [typingUser, setTypingUser] = useState("");
  const chatBoxRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null); // Add ref for input element

  // Load past messages on mount
  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessages(roomId);
        setMessages(messages);
      } catch (error) {
        console.log(error);
      }
    }

    if (connected) {
      loadMessages();
    }
  }, [connected, roomId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (!connected) return;

    const sock = new SockJS(`${backend_url}/chat`);
    const client = Stomp.over(sock);

    client.connect({}, () => {
      setStompClient(client);
      toast.success("Connected");

      client.subscribe(`/topic/room/${roomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMessage]);
      });

      client.subscribe(`/topic/typing/${roomId}`, (typingMessage) => {
        const senderName = typingMessage.body;
        if (senderName !== currentUser) {
          setTypingUser(senderName);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser("");
            typingTimeoutRef.current = null;
          }, 0);
        }
      });
    });

    return () => {
      client.disconnect(() => {
        // console.log("WebSocket disconnected");
      });
    };
  }, [roomId, connected, currentUser]);

  // Modified sendMessage function to maintain focus
  const sendMessage = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");

      // Keep focus on input after sending message (especially important for mobile)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    }
  };

  // Modified key handler to prevent default behavior and maintain focus
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default form submission behavior
      sendMessage();
    }
  };

  // Modified button click handler
  const handleSendClick = () => {
    sendMessage();
  };

  const sendTypingStatus = () => {
    if (stompClient && connected) {
      stompClient.send(`/app/typing/${roomId}`, {}, currentUser);
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (stompClient) stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full h-20 bg-teal-700 dark:bg-teal-700 shadow flex justify-around items-center z-10 px-1">
        <h1 className="text-xl font-semibold text-white">
          Room: <span className="text-yellow-300">{roomId}</span>
        </h1>
        <div>
          <h1 className="text-xl font-semibold text-white">
            User: <span className="text-yellow-300">{currentUser}</span>
          </h1>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full cursor-pointer text-white"
          >
            Leave 
          </button>
        </div>
      </header>

      <main
        ref={chatBoxRef}
        className="mt-20 pb-20 px-4 sm:px-10 w-full sm:w-2/3 bg-emerald-600 dark:bg-emerald-600 mx-auto overflow-auto border-2 border-green-700 flex-1"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`my-1 p-2 max-w-xs border-2 ${message.sender === currentUser
                  ? "bg-gray-950 rounded-tl-lg rounded-bl-lg rounded-br-lg"
                  : "bg-blue-800 rounded-tr-lg rounded-bl-lg rounded-br-lg"
                }`}
            >
              <div className="flex flex-row gap-2">
                <img
                  className="h-10 w-10 shrink-0"
                  src={"https://avatar.iran.liara.run/public/43"}
                  alt="avatar"
                />
                <div className="flex flex-col gap-1 overflow-hidden">
                  <p className="text-sm font-bold text-green-400">
                    {message.sender === currentUser ? "" : message.sender}
                  </p>
                  {message.sender === currentUser ? "" : <hr />}
                  <p className="break-words whitespace-pre-wrap text-white max-w-full">
                    {message.content}
                  </p>
                  <p className="text-xs text-gray-400 text-end">
                    {timeAgo(message.timeStamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {typingUser && typingUser !== currentUser && (
          <div className="text-start text-xl text-gray-300 my-2">
            {typingUser} is typing...
          </div>
        )}
      </main>

      {/* Input box at bottom */}
      <div className="fixed bottom-0 w-full px-4 sm:px-0 h-16 z-50 bg-gray-900 dark:bg-gray-900">
        <div className="h-full gap-2 flex items-center justify-between rounded-full w-full sm:w-2/3 mx-auto border-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              sendTypingStatus();
            }}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Type your message here..."
            className="w-full border-gray-600 dark:border-gray-600 bg-gray-800 dark:bg-gray-800 px-5 rounded-full h-full focus:outline-none text-white placeholder-gray-400"
            autoComplete="off"
            inputMode="text"
            enterKeyHint="send"
          />
          <div className="flex gap-1">
            <button
              onClick={handleSendClick}
              className="bg-green-600 dark:bg-green-600 h-10 w-10 flex justify-center items-center rounded-full border-2 hover:cursor-pointer mr-5 text-white"
            >
              <MdSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;