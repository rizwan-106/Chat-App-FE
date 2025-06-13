import React from 'react'
import { BrowserRouter, Routes } from 'react-router'
import { Route } from 'react-router'
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
