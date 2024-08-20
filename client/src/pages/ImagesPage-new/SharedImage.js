import React, { useState } from 'react';
import Modal from "../../components/ImageModal/ImageModal";
import { useParams } from "react-router-dom";

const SharedImage = () => {
   
    const { eventName, userId } = useParams();
    const image =`https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/${eventName}/${userId}`;
    





    return (
            <Modal
                clickedImg={image}
                clickedUrl={`${eventName}/${userId}`}
                favourite = {false}
                sharing ={true}
                close={false}
            />
    );
};

export default SharedImage;
