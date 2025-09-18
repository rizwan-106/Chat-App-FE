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
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const [typingUser, setTypingUser] = useState("");
  const typingTimeoutRef = useRef(null);
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
          }, 1000);
        }
      });
    });

    return () => {
      client.disconnect(() => {
        // console.log("WebSocket disconnected");
      });
    };
  }, [roomId, connected, currentUser]);

  const sendMessage = async () => {
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
    }
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
      <header className="fixed top-0 w-full h-20 dark:bg-teal-700 shadow flex justify-around items-center z-10 px-1">
        <h1 className="text-xl font-semibold">
          Room: <span className="text-yellow-300">{roomId}</span>
        </h1>
        <div>
          <h1 className="text-xl font-semibold">
            User: <span className="text-yellow-300">{currentUser}</span>
          </h1>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full cursor-pointer"
          >
            Leave 
          </button>
        </div>
      </header>
      <main
        ref={chatBoxRef}
        className="mt-20 pb-15 px-4 sm:px-10 w-full sm:w-2/3 dark:bg-emerald-600 mx-auto overflow-auto border-2 border-green-700 flex-1"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"
              }`}
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
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              sendTypingStatus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            type="text"
            placeholder="Type your message here..."
            className="w-full dark:border-gray-600 dark:bg-gray-800 px-5 rounded-full h-full focus:outline-none"
          />
          <div className="flex gap-1">
            <button
              onClick={sendMessage}
              className="dark:bg-green-600 h-10 w-10 flex justify-center items-center rounded-full border-2 hover:cursor-pointer mr-5"
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
