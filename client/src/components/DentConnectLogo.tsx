import logoPath from "@assets/Website Header updated_1751940892927.png";

interface DentConnectLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function DentConnectLogo({ className = "", width = 200, height = 50 }: DentConnectLogoProps) {
  return (
    <img 
      src={logoPath} 
      alt="DentConnect" 
      className={`object-contain ${className}`}
      width={width}
      height={height}
    />
  );
}

export default DentConnectLogo;