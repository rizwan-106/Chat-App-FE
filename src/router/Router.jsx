import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import JoinCreateChat from '../components/JoinCreateChat'
import ChatBox from '../components/ChatBox'

const Router = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<JoinCreateChat />} />
          <Route path="/chat" element={<ChatBox />}></Route>
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default Router
