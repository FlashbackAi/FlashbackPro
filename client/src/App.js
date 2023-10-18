import React, { useState } from 'react';
import './App.css';

function App() {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (e) => {
        setSelectedFiles([...e.target.files]);
    };

    const handleSubmit = async () => {
        const formData = new FormData();

        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData
            });
            alert('Uploaded successfully!');
        } catch (error) {
            alert('Error uploading files.');
        }
    };

    return (
        <div className="App">
            <h1>Upload Images</h1>
            <input type="file" multiple onChange={handleFileChange} />
            <button onClick={handleSubmit}>Upload</button>
        </div>
    );
}

export default App;

