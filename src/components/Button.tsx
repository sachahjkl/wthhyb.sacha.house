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
    goddamnit: "bg-linear-to-b from-[#d2043b] to-[#b30431] text-white hover:from-[#F05059] hover:to-[#D62F37]",
    nevermind:
      "bg-linear-to-b from-[#1d8733] to-[#176a2b] text-white hover:from-[#29a345] hover:to-[#219c3b] relative overflow-hidden",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} text-shadow-sm`} onClick={onClick}>
      {variant === "nevermind" && showRibbon && (
        <span className="absolute top-2 -right-6 bg-linear-to-b from-[#FFB84D] to-[#FF9500] text-black tracking-wide text-sm 
        font-extrabold px-8 rotate-[40deg] shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
          FREE
        </span>
      )}
      {children}
    </button>
  );
}
