import React, { useState } from 'react';

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
            <h1>Create your FlashBack</h1>
            <input type='text' placeholder='enter you FlashBack name'></input>
            <button  onClick={handleSubmit}>Create Folder</button>
            <br></br>
            <input type="file" multiple onChange={handleFileChange} />
            <button onClick={handleSubmit}>Upload</button>
        </div>
    );
}

export default App;

