import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './TextOutput.css';

const socket = io();

function TextOutput() {
    const [text, setText] = useState('');
    const [fadeClass, setFadeClass] = useState('');
    const containerRef = useRef(null); // Reference for the textContainer
    const textRef = useRef(null); // Reference for the text div

    useEffect(() => {
        socket.on('receiveData', (receivedData) => {
            if (receivedData.text) {
                setFadeClass('fade-out'); // Trigger fade-out for existing text
                setTimeout(() => {
                    setText(receivedData.text); // Update the text
                    setFadeClass('fade-in'); // Trigger fade-in animation
                }, 500); // Match the fade-out duration
            } else {
                setFadeClass('fade-out'); // Trigger fade-out animation
                setTimeout(() => setText(''), 500); // Clear text after fade-out
            }
        });

        return () => {
            socket.off('receiveData');
        };
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const text = textRef.current;

        if (container && text) {
            const containerWidth = container.offsetWidth;
            const textWidth = text.scrollWidth;
            const scaleWidth = containerWidth / textWidth;

            const containerHeight = container.offsetHeight;
            const textHeight = text.scrollHeight;
            const scaleHeight = containerHeight / textHeight;

            if (text.innerHTML.length > 29) {
                text.style.transform = `scale(${scaleWidth}, ${scaleHeight})`;
            } else {
                text.style.transform = `scale(${scaleHeight}, ${scaleHeight})`;
            }
        }
    }, [text]); // Trigger scaling when `text` updates

    return (
        <div className="textContainer" ref={containerRef}>
            <div className={`text ${fadeClass}`} id="dataDisplay" ref={textRef}>{text}</div>
        </div>
    );
}

export default TextOutput;
