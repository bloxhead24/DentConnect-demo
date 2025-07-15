interface SimpleLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function SimpleLogo({ className = "", width = 200, height = 50 }: SimpleLogoProps) {
  return (
    <div 
      className={`flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-lg ${className}`}
      style={{ width, height }}
    >
      <span className="text-2xl">DentConnect</span>
    </div>
  );
}

export default SimpleLogo;