import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export const DisplaySlider = ({ ...props }) => {
  return (
    <>
      <Slider {...props} />
    </>
  );
};
