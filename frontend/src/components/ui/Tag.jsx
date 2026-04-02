function Tag({ children, variant = "default", className = "", color = null }) {
  const variants = {
    default: "bg-surface-elev text-secondary",
    open: "bg-emerald-500/12 text-emerald-400",
    merged: "bg-purple-500/12 text-purple-400",
    review: "bg-amber-500/12 text-amber-400",
    draft: "bg-zinc-500/12 text-zinc-400",
  };

  const style = color
    ? {
      backgroundColor: `#${color}20`, // 12% opacity hex
      color: `#${color}`,
      border: `1px solid #${color}40`,
    }
    : {};

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${!color ? variants[variant] : ""
        } ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

export default Tag;