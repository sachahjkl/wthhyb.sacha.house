interface ButtonProps {
  variant: "goddamnit" | "nevermind";
  children: React.ReactNode;
  onClick?: () => void;
  showRibbon?: boolean;
}

export function Button({ variant, children, onClick, showRibbon = true }: ButtonProps) {
  const baseClasses = "px-8 py-3 text-2xl rounded-xl active:translate-y-1 shadow-lg";

  const variantClasses = {
    goddamnit: "bg-gradient-to-b from-[#d7003E] to-[#b30033] text-white",
    nevermind: "bg-gradient-to-b from-[#2bab49] to-[#1b8734] text-white relative overflow-hidden",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} text-shadow-sm`}
      onClick={onClick}
    >
      {variant === "nevermind" && showRibbon && (
        <span className="absolute top-2 -right-6 bg-linear-to-b font-bold from-[#FF8307] to-[#FF9500] text-black tracking-wide text-sm px-8 rotate-40 shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
          FREE
        </span>
      )}
      {children}
    </button>
  );
}
