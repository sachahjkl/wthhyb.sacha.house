interface ButtonProps {
  variant: "goddamnit" | "nevermind";
  children: React.ReactNode;
  onClick?: () => void;
  showRibbon?: boolean;
}

export function Button({ variant, children, onClick, showRibbon = true }: ButtonProps) {
  const baseClasses =
    "px-12 py-4 text-2xl font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg";

  const variantClasses = {
    goddamnit: "bg-linear-to-b from-[#E8424A] to-[#C1272D] text-white hover:from-[#F05059] hover:to-[#D62F37]",
    nevermind:
      "bg-linear-to-b from-[#3CB371] to-[#2E8B57] text-white hover:from-[#4BC57F] hover:to-[#38A365] relative overflow-hidden",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} text-shadow-sm`} onClick={onClick}>
      {variant === "nevermind" && showRibbon && (
        <span className="absolute top-2 -right-8 bg-linear-to-b from-[#FFB84D] to-[#FF9500] text-black text-sm font-extrabold px-8 rotate-45 shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
          FREE
        </span>
      )}
      {children}
    </button>
  );
}
