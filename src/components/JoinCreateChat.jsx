import { useState } from "react";
import toast from "react-hot-toast";
import chatIcon from "../asset/chat.png";
import { useNavigate } from "react-router";
import { createRoomApi, joinChatApi } from "../services/RoomServices";
import useChatContext from "../context/ChatContext";
const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });
  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input!!");
      return false;
    }
    return true;
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const response = await createRoomApi(detail.roomId);
        toast.success("Room Created Successfully !!");
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        console.log(error);
        if (error.status == 400) {
          toast.error("Room  already exists !!");
        } else {
          toast("Error in creating room");
        }
      }
    }
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("joined...");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status == 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Error in joining room");
        }
      }
    }
  }
  return (

    <div className="min-h-screen flex items-center justify-center">
      <div className="p-10  w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900  shadow-2xl">
        <div>
          <img src={chatIcon} className="w-24 mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold text-center ">
          Join Room / Create Room
        </h1>
        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Your name
          </label>
          <input
            onChange={handleFormInputChange}
            value={detail.userName}
            type="text"
            id="name"
            name="userName"
            placeholder="Enter your name"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Room ID / New Room ID
          </label>
          <input
            name="roomId"
            onChange={handleFormInputChange}
            value={detail.roomId}
            type="text"
            id="name"
            placeholder="Enter the room id (e.g. room1, room2, etc.)"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={joinChat}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 hover:dark:bg-blue-700 text-white font-medium rounded-full cursor-pointer transition-colors duration-200"
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 hover:dark:bg-orange-700 text-white font-medium rounded-full cursor-pointer transition-colors duration-200"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};
export default JoinCreateChat;
