import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './ImgOutput.css';

const socket = io('http://localhost:3001');

function ImgOutput() {
    const [image, setImage] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        socket.on('receiveData', (receivedData) => {
            if (receivedData.previewSrc) {
                setIsTransitioning(true); // Trigger fade-out for the current image
                setTimeout(() => {
                    setImage(receivedData.previewSrc); // Update to the new image
                    setIsTransitioning(false); // Trigger fade-in for the new image
                }, 500); // Match the fade-out duration
            } else {
                // Fade out if no image is received
                setIsTransitioning(true);
                setTimeout(() => {
                    setImage(null); // Clear the image after fade-out
                    setIsTransitioning(false);
                }, 500); // Match the fade-out duration
            }
        });

        return () => {
            socket.off('receiveData');
        };
    }, [image]);

    return (
        <div className="imgContainer">
            {image && (
                <img
                    className={`imgDisplay ${isTransitioning ? 'fade-out' : 'fade-in'}`}
                    src={image}
                    alt="Displayed content"
                />
            )}
        </div>
    );
}

export default ImgOutput;
