import React from "react";

export const BackgroundVideo = () => {
  if (__IS_VERCEL__) {
    return <div id="bg-gradient" aria-hidden="true" />;
  }

  return (
    <video autoPlay muted loop playsInline id="bg-video">
      <source src="/assets/videos/video.webm" type="video/webm" />
      <source src="/assets/videos/video.mp4" type="video/mp4" />
      Your browser does not support HTML5 video.
    </video>
  );
};
