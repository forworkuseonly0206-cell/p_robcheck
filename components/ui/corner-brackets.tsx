// Thin corner brackets around a box (the Spade "technical" frame)
export function CornerBrackets({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const c = "absolute h-3 w-3 border-primary/80"
  return (
    <div className={`relative ${className}`}>
      <span className={`${c} -left-px -top-px border-l border-t`} />
      <span className={`${c} -right-px -top-px border-r border-t`} />
      <span className={`${c} -bottom-px -left-px border-b border-l`} />
      <span className={`${c} -bottom-px -right-px border-b border-r`} />
      {children}
    </div>
  )
}