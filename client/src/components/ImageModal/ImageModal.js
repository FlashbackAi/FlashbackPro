import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../Loader/LoadingSpinner";
import { ArrowDownToLine, Heart, ChevronRight, ChevronLeft, X } from "lucide-react";
import API_UTIL from "../../services/AuthIntereptor";
import styled from 'styled-components';

// Styled components matching original CSS exactly
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalOuter = styled.div`
  position: relative;
  max-width: fit-content;
  max-height: fit-content;
  background: #000000;
  height: fit-content;
  padding: 3em;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    width: 95%;
    padding: 1em;
  }

  @media (max-width: 480px) {
    padding: 0.5em;
  }

  img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;

    @media (max-width: 768px) {
      max-height: 60vh;
    }

    @media (max-width: 480px) {
      max-height: 50vh;
    }
  }
`;

const NavigationButton = styled.button`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  height: 4rem;
  cursor: pointer;
  z-index: 1001;
  padding: 0;

  &.left-arrow {
    left: 20px;
  }

  &.right-arrow {
    right: 20px;
  }

  svg {
    color: white;
  }

  @media (max-width: 768px) {
    svg {
      width: 32px;
      height: 32px;
    }
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const DesktopControls = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1001;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileControls = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    gap: 16px;
    z-index: 1001;

    &.top-left {
      top: 20px;
      left: 20px;
    }

    &.bottom-right {
      bottom: 80px; // Adjusted to be above the chevron
      right: 20px;
      flex-direction: column;
    }
  }
`;

const LoadingDots = styled.span`
  position: relative;
  &::after {
    content: '...';
    font-size: 20px;
    color: white;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% { content: '.'; }
    33% { content: '..'; }
    66% { content: '...'; }
  }
`;

const ControlButton = styled.button`
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0;

  &:hover {
    transform: scale(1.1);
  }

  svg {
    color: white;
  }

  &.downloading {
    pointer-events: none;
    opacity: 0.7;
  }
`;

const ImageModal = ({
  clickedImg,
  clickedImgIndex,
  setClickedImg,
  clickedUrl,
  handleBackButton,
  handleFavourite,
  clickedImgFavourite,
  images,
  favourite = true,
  sharing = true,
  close = true,
  select = false,
}) => {
  const history = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(clickedImgIndex);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFavourite, setIsFavourite] = useState(clickedImgFavourite);
  const touchStartRef = useRef(0);
  const isNavigatingRef = useRef(false);
  const [touchStartX, setTouchStartX] = useState(0);
const [touchEndX, setTouchEndX] = useState(0);
const [isSwiping, setIsSwiping] = useState(false);
const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    if (isNavigatingRef.current) {
      setClickedImg(images[currentIndex].thumbnail);
      setIsFavourite(images[currentIndex].isFavourites);
      isNavigatingRef.current = false;
    }
  }, [currentIndex, images, setClickedImg]);

  const handleClick = (e) => {
    if (e.target.classList.contains("dismiss")) {
      setClickedImg(null);
      history(-1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      isNavigatingRef.current = true;
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      isNavigatingRef.current = true;
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    const disablePinchZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", disablePinchZoom, {
      passive: false,
    });
    return () => {
      document.removeEventListener("touchmove", disablePinchZoom);
    };
  }, []);

  useEffect(() => {
    function touchHandler(event) {
      if (event.touches.length > 1) {
        //the event is multi-touch
        //you can then prevent the behavior
        event.preventDefault();
      }
    }
    window.addEventListener("touchstart", touchHandler, { passive: false });
    return () => {
      window.removeEventListener("touchstart",touchHandler);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          handleClose(e);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]); 

  const handleSwipeStart = (e) => {
    if (e.touches.length > 1) {
      // Prevent zoom by stopping the event propagation and preventing default behavior
      // e.preventDefault();
      setIsZooming(true);
      setIsSwiping(false);
    } else{
      setTouchStartX(e.touches[0].clientX);

    }
   
};

const handleSwipeMove = (e) => {
  if (e.touches.length > 1) {
    // Block zoom during touch move
    // e.preventDefault();    
    setIsZooming(true);
    setIsSwiping(false);
} else {
  if (!isSwiping){
    setIsSwiping(true);
    setIsZooming(false);
  } 
  setTouchEndX(e.touches[0].clientX);
}
 
    
};

const handleSwipeEnd = () => {
    if (!isSwiping || isZooming) return;

    const swipeDistance = touchStartX - touchEndX;
    const swipeThreshold = window.innerWidth / 4; // 25% of the screen width

    if (swipeDistance > swipeThreshold) {
        handleNext(); // Navigate to next image
    } else if (swipeDistance < -swipeThreshold) {
        handlePrev(); // Navigate to previous image
    }

    // Reset swipe tracking
    setTouchStartX(0);
    setTouchEndX(0);
    setIsSwiping(false);
};

  const onLoad = () => {
    const lazySpan = document.querySelector(".lazyImage");
    const loader = document.querySelector(
      ".overlay.dismiss .loading-spinner-container"
    );
    loader && loader.remove();
    lazySpan && lazySpan.classList.add("visible");
  };
  // const handleSwipeMove = (e) => {
  //   const touch = e.touches[0];
  //   const touchEnd = touch.clientX;
  //   const swipeThresholdInPixels = 32;

  //   if (touchStartRef.current - touchEnd > swipeThresholdInPixels) {
  //     handleNext();
  //     touchStartRef.current = touchEnd;
  //   } else if (touchEnd - touchStartRef.current > swipeThresholdInPixels) {
  //     handlePrev();
  //     touchStartRef.current = touchEnd;
  //   }
  // };

  const downloadCurrentImage = async (e) => {
    e.stopPropagation();
    if (!clickedImg) {
      console.error("No current image found");
      return;
    }
  
    setIsDownloading(true);
    const url = images[currentIndex].original;
    try {
      const response = await API_UTIL.post('/downloadImage', {
        imageUrl: url,
      });
  
      if (response.status === 200) {
        const link = document.createElement("a");
        link.href = response.data;
        const fileName = url.split('/').pop() || 'image.jpg';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("Failed to fetch image");
      }
    } catch (error) {
      console.error("Error downloading image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // const addToFavourite = (e) => {
  //   e.stopPropagation();
  //   const fav = document.querySelector(".favourite");
  //   if (isFavourite) fav.classList.remove("bgRed");
  //   else fav.classList.add("bgRed");

  //   handleFavourite(currentIndex, images[currentIndex].original, !isFavourite);
  //   setIsFavourite((isFav) => !isFav);
  // };

  const addToFavourite = (e) => {
    e.stopPropagation();
    handleFavourite(currentIndex, images[currentIndex].original, !isFavourite);
    setIsFavourite((isFav) => !isFav);
  };
  
  const handleClose = (e) => {
    e.stopPropagation();
    setClickedImg(null);
    history(-1);
  };

  return (
<Overlay 
    className="overlay dismiss"
    onTouchStart={handleSwipeStart}
    onTouchMove={handleSwipeMove}
    onTouchEnd={handleSwipeEnd} // Add this for swipe completion
    onClick={handleClick}
>

      <LoadingSpinner />
      <ModalOuter className="modalOuter lazyImage hidden" onClick={e => e.stopPropagation()}>
        {/* Desktop Controls */}
        <DesktopControls>
          <ControlButton onClick={handleClose}>
            <X size={24} />
          </ControlButton>
          <ControlButton 
            onClick={downloadCurrentImage}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <LoadingDots />
            ) : (
              <ArrowDownToLine size={24} />
            )}
          </ControlButton>
          {favourite && (
            <ControlButton onClick={addToFavourite}>
              <Heart 
                size={24}
                fill={isFavourite ? "red" : "none"}
                stroke={isFavourite ? "red" : "white"}
              />
            </ControlButton>
          )}
          {select && (
            <div
              // className="dFlex alignCenter cursor-pointer"
              onClick={addToFavourite}
            >
              <Heart className={"favourite " + (isFavourite ? "bgRed" : "")} />
              Select
            </div>
          )}
        </DesktopControls>

        {/* Mobile Controls */}
        <MobileControls className="top-left">
          <ControlButton onClick={handleClose}>
            <X size={24} />
          </ControlButton>
        </MobileControls>

        <MobileControls className="bottom-right">
          {favourite && (
            <ControlButton onClick={addToFavourite}>
              <Heart 
                size={24}
                fill={isFavourite ? "red" : "none"}
                stroke={isFavourite ? "red" : "white"}
              />
            </ControlButton>
          )}
                    {select && (
            <div
              // className="dFlex alignCenter cursor-pointer"
              onClick={addToFavourite}
            >
              <Heart className={"favourite " + (isFavourite ? "bgRed" : "")} />
              Select
            </div>
          )}
          <ControlButton 
            onClick={downloadCurrentImage}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <LoadingDots />
            ) : (
              <ArrowDownToLine size={24} />
            )}
          </ControlButton>
        </MobileControls>

        <ImageContainer>
          <img onLoad={onLoad} src={clickedImg} alt="bigger pic" />
        </ImageContainer>

        {currentIndex > 0 && (
          <NavigationButton className="left-arrow" onClick={handlePrev}>
            <ChevronLeft size={40} />
          </NavigationButton>
        )}
        
        {currentIndex < images.length - 1 && (
          <NavigationButton className="right-arrow" onClick={handleNext}>
            <ChevronRight size={40} />
          </NavigationButton>
        )}
      </ModalOuter>
    </Overlay>
  );
};

export default ImageModal;