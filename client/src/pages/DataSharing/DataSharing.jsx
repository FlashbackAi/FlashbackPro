import React, { useState, useEffect } from 'react';
import API_UTIL from '../../services/AuthIntereptor';
import AppBar from '../../components/AppBar/AppBar';

function DataSharingPage() {
    const [photoCount, setPhotoCount] = useState(null);
    const userPhoneNumber = localStorage.userPhoneNumber; // Replace with actual user phone number

    useEffect(() => {
        // Fetch the count from the backend API
        API_UTIL.get(`/imagesForFederated/${userPhoneNumber}`)
            .then(response => {
                setPhotoCount(response.data.count);
            })
            .catch(error => {
                console.error('Error fetching photo count:', error);
            });
    }, [userPhoneNumber]);

    return (
        <div>
            <AppBar showCoins ={true}></AppBar>
            <h1>Data Sharing</h1>
            {photoCount !== null ? (
                <p>Number of photos for user {userPhoneNumber}: {photoCount}</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default DataSharingPage;
