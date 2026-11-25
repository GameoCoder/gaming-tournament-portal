import React from "react";
import { useLocation } from "react-router-dom";
import wallpaperImg from "../../../assets/images/wallpaper/Wallpaper.png";

const TILES_PER_GROUP = [0, 1, 2];

const MarqueeGroup = ({ prefix }) => (
  <div className="bg-marquee-group">
    {TILES_PER_GROUP.map((idx) => (
      <div key={`${prefix}-${idx}`} className="bg-marquee-tile">
        <img
          src={wallpaperImg}
          alt=""
          className="bg-marquee-img"
          loading="eager"
          decoding="async"
        />
      </div>
    ))}
  </div>
);

export const BackgroundVideo = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div
      id="bg-wallpaper-stage"
      className={isHome ? "" : "marquee-paused"}
      aria-hidden="true"
    >
      <div className="bg-liquid-orbs">
        <span className="bg-orb bg-orb-1" />
        <span className="bg-orb bg-orb-2" />
      </div>

      <div className="bg-marquee-rows">
        <div className="bg-marquee-row">
          <div className="bg-marquee-track bg-marquee-left">
            <MarqueeGroup prefix="top-a" />
            <MarqueeGroup prefix="top-b" />
          </div>
        </div>

        <div className="bg-marquee-row">
          <div className="bg-marquee-track bg-marquee-right">
            <MarqueeGroup prefix="bot-a" />
            <MarqueeGroup prefix="bot-b" />
          </div>
        </div>
      </div>

      <div className="bg-liquid-glass" />
    </div>
  );
};
