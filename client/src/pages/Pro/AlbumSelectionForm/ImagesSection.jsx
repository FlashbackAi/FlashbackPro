import {useEffect,React} from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Heart } from 'lucide-react';

import Modal from "../../../components/ImageModal/ImageModalNew";
import LoadingSpinner from "../../../components/Loader/LoadingSpinner"; 

const ImagesSection = ({ images, fetchTimeout, clickedImg, handleClickImage, clickedImgFavourite, setClickedImg, clickedUrl, handleBackButton, handleFavourite, isLoading, tabKey, displayFavIcon }) => {

  useEffect(() => {
    console.log("ImagesSection mounted with props:", {
      images,
      fetchTimeout,
      clickedImg,
      handleClickImage,
      clickedImgFavourite,
      clickedUrl,
      isLoading,
      tabKey,
    });
  }, []);

  const handleFav = async (imageUrl, isFav) => {
    console.log(isFav)
    handleFavourite(imageUrl, isFav, images, tabKey);
  }

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : images.length > 0 ? (
        <div className="wrapper">
          {images.map((item, index) => (
            <div key={index} className="wrapper-images">
              <LazyLoadImage
                src={item.thumbnailUrl}
                effect="blur"
                onLoad={() => item.selected === true && displayFavIcon(item.s3_url)}
                onClick={() => handleClickImage(item, item.url)}
              />
              <Heart
                data-key={item.s3_url}
                className="image_favourite_down hidden"
              />
            </div>
          ))}
          <div>
            {clickedImg && (
              <Modal
                clickedImg={clickedImg}
                clickedImgFavourite={clickedImgFavourite}
                setClickedImg={setClickedImg}
                clickedUrl={clickedUrl}
                handleBackButton={handleBackButton}
                handleFavourite={handleFav}
                favourite={false}
                sharing={false}
                close={true}
                select={true}
              />
            )}
          </div>
        </div>
      ) : fetchTimeout ? (
        <p>No images to display</p>
      ) : (
        <p>Failed to load images</p>
      )}
    </div>
  );
};

export default ImagesSection;
