import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import './App.css';
import Item from './components/Item';
import AddItemButton from './components/AddItemButton';
import TextOutput from './components/TextOutput';
import ImgOutput from './components/ImgOutput';

const socket = io(process.env.REACT_APP_SOCKET_SERVER || 'http://localhost:3001');

function List() {
  const [items, setItems] = useState([]);

  const handleAddItem = () => {
    setItems((prevItems) => [...prevItems, { id: Date.now(), text: '', previewSrc: null }]);
  };

  const handleDeleteItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleMoveUp = (id) => {
    setItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.id === id);
      if (index > 0) {
        const newItems = [...prevItems];
        [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
        return newItems;
      }
      return prevItems;
    });
  };

  const handleMoveDown = (id) => {
    setItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.id === id);
      if (index < prevItems.length - 1) {
        const newItems = [...prevItems];
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        return newItems;
      }
      return prevItems;
    });
  };

  const handleImageUpload = (id, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setItems((prevItems) => {
        const newItems = [...prevItems];
        const index = newItems.findIndex((item) => item.id === id);
        if (index !== -1) {
          newItems[index].previewSrc = reader.result;
        }
        return newItems;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendData = (id, text, previewSrc) => {
    const data = { id, text, previewSrc }; // Send only the current item's data
    socket.emit('sendData', data);
  };

  return (
    <div className='App'>
      <div className='container'>
        {items.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            text={item.text}
            previewSrc={item.previewSrc}
            onDel={() => handleDeleteItem(item.id)}
            onMoveUp={() => handleMoveUp(item.id)}
            onMoveDown={() => handleMoveDown(item.id)}
            onImageUpload={handleImageUpload}
            onSend={handleSendData} // Pass the handler
          />
        ))}
        <AddItemButton onAdd={handleAddItem} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<List />} />
        <Route path="/text-output" element={<TextOutput />} />
        <Route path="/img-output" element={<ImgOutput />} />
      </Routes>
    </Router>
  )
}

export default App;
