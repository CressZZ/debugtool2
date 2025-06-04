import { useDebugBackgroundStore } from "../../store/useDebugBackgourndStore";

export function DebugBackground({
  backgroundImage,
  isMobile,
}: {
  backgroundImage: string;
  isMobile: boolean;
}) {

  const opacity = useDebugBackgroundStore(state => state.opacity);
  const isInverted = useDebugBackgroundStore(state => state.isInverted);

  const backgroundSize = isMobile ? "375px" : "1920px 1080px"; 

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: "center",
        backgroundSize: backgroundSize,
        backgroundRepeat: "no-repeat",
        opacity: opacity,
        filter: isInverted ? "invert(1)" : "none",
      }}
    ></div>
  );
}
