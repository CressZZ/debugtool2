import { useDebugBackgroundStore } from "../../store/useDebugBackgourndStore";

export function DebugBackground({
  backgroundImage,
}: {
  backgroundImage: string;
}) {

  const opacity = useDebugBackgroundStore(state => state.opacity);
  const isInverted = useDebugBackgroundStore(state => state.isInverted);

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
        backgroundSize: "1920px 1080px",
        backgroundRepeat: "no-repeat",
        opacity: opacity,
        filter: isInverted ? "invert(1)" : "none",
      }}
    ></div>
  );
}
