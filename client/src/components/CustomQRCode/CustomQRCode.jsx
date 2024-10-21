// CustomQRCode.js
import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

const CustomQRCode = ({ value, size = 300, logoUrl, logoSize = 50 }) => {
  const qrCodeRef = useRef(null);

  const qrCode = new QRCodeStyling({
    width: size,
    height: size,
    data: value,
    image: logoUrl,
    dotsOptions: {
      color: 'black',
      type: 'rounded',
    },
    cornersSquareOptions: {
      color: '#000000',
      type: 'extra-rounded',
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 5,
      imageSize: 0.3,
    },
    backgroundOptions: {
      color: '#ffffff',
    },
  });

  useEffect(() => {
    if (qrCodeRef.current) {
      qrCode.append(qrCodeRef.current);
    }

    return () => {
      qrCodeRef.current?.firstChild?.remove();
    };
  }, [value, size, logoUrl]);

  return <div ref={qrCodeRef} />;
};

export default CustomQRCode;
