import React from 'react';
import './Banner.css'; // Import the CSS for the banner

const Banner = ({ image, children }) => {
  return (
    <div
      className="banner"
      style={{
        backgroundImage: `url(${image})`,
      }}
    >
      {children}
    </div>
  );
};

export default Banner;