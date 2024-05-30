import React, { useRef, useState } from "react";
import collageImage1 from "../../../media/images/23 Bride Stills-bg-rem.png";
import "./Collage.css";
import { useGesture } from "react-use-gesture";

const Collage = () => {
  let [crop, setCrop] = useState({ x: 0, y: 0, scale: 1 });
  let [scale, setScale] = useState();
  let imageRef = useRef();
  useGesture(
    {
      onDrag: ({ offset: [dx, dy] }) => {
        setCrop((crop) => ({ ...crop, x: dx, y: dy }));
      },
      onPinch: ({ offset: [d] }) => {
        setScale(d / 2);
      },
    },
    {
      target: imageRef,
      eventOptions: { passive: false },
    }
  );
  return (
    <section className="fb_collage">
      {/* <div
        className="on-top-div"
        onClick={(e) => {
          console.log("sdsd");
          e.stopPropagation();
        }}
      ></div> */}
      <div className="background">

      <img
        src={collageImage1}
        style={{
          position: "relative",
          left: crop.x,
          top: crop.y,
          transform: `scale(${scale})`,
          touchAction: "none",
          height: "100%",
          width: "100%",
        }}
        ref={imageRef}
        onClick={(e) => e.stopPropagation()}
      />
      {/* <img className="foreground" src={collageImage1} alt="Foreground Image" />  */}
      </div>
    </section>
  );
};

export default Collage;
