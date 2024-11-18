import React, { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';
import './Item.css';

function Item({ id, text, previewSrc, onMoveUp, onMoveDown, onDel, onSend, onImageUpload }) {
    const [localText, setLocalText] = useState(text || ''); // Local state for text input

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                // Define compression options
                const options = {
                    maxSizeMB: 1, // Maximum size in MB
                    maxWidthOrHeight: 1000, // Maximum width or height in pixels
                    useWebWorker: true // Use web workers for faster compression
                };
    
                // Compress the file
                const compressedFile = await imageCompression(file, options);
                
                // Check if the compressedFile is a valid Blob
                if (compressedFile instanceof Blob) {
                    // Convert the Blob back into a File object
                    const compressedFileWithName = new File([compressedFile], file.name, {
                        type: compressedFile.type,
                        lastModified: Date.now(),
                    });
                    
                    // Pass the compressed file to the parent component
                    onImageUpload(id, compressedFileWithName);
    
                    console.log('Compressed file size:', compressedFileWithName.size / 1024, 'KB'); // Log compressed file size
                } else {
                    console.error('Compressed file is not a valid Blob:', compressedFile);
                }
            } catch (error) {
                console.error('Error during image compression:', error);
            }
        } else {
            console.error('No file selected.');
        }
    };

    const handleSendClick = () => {
        onSend(id, localText, previewSrc); // Send id, local text, and preview source
    };

    const handleFormSubmit = (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
    };

    return (
        <div className="item">
            <div className="innerDiv">
                <div className="icon">
                    <button className='up' onClick={onMoveUp}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m480-520.35-184 184L232.35-400 480-647.65 727.65-400 664-336.35l-184-184Z"/></svg>
                    </button>
                    <button className='down' onClick={onMoveDown}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-336.35 232.35-584 296-647.65l184 184 184-184L727.65-584 480-336.35Z"/></svg>
                    </button>
                </div>
                <form className="itemForm" onSubmit={handleFormSubmit}>
                    <input
                        type="text"
                        value={localText}
                        onChange={(e) => setLocalText(e.target.value)}
                    />
                    <input
                        type="file"
                        id={`file-input-${id}`}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </form>
                <label className='inputImgLabel' htmlFor={`file-input-${id}`} style={{ cursor: 'pointer' }}>
                    {/* If a file is selected, show the preview, otherwise show a placeholder */}
                    <img
                        className='inputImg'
                        alt="No image" 
                        src={previewSrc || '/path/to/placeholder-image.jpg'} // Placeholder image if no preview
                    />
                </label>
                <button className="delButton" onClick={onDel}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#EA3323"><path d="M265.18-113.3q-31.56 0-53.74-22.13-22.17-22.13-22.17-53.63v-548.79h-45.21v-75.75h203.4v-38.04h264.76v38.04h203.72v75.75h-45.21v548.79q0 31-22.42 53.38-22.43 22.38-53.49 22.38H265.18Zm429.64-624.55H265.18v548.79h429.64v-548.79ZM361.16-270.91h71.21v-386h-71.21v386Zm166.47 0H599v-386h-71.37v386ZM265.18-737.85v548.79-548.79Z"/></svg>
                </button>
            </div>
            <button className="sendButton" onClick={handleSendClick}>
                <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFFFFF"><path d="M113.86-153.62v-652.76L887.97-480 113.86-153.62Zm72.81-111.33L699.92-480 186.67-697.05v152.77L430.95-480l-244.28 62.95v152.1Zm0 0v-432.1 432.1Z"/></svg>
            </button>
        </div>
    );
}

export default Item;
