/** Onset caret wordmark (design choice L-2). Products render as "keyset_ by onset". */
export function Wordmark({ product, blink = true, className = "" }: { product?: string; blink?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 font-mono font-medium tracking-tight ${className}`}>
      <span>
        onset
        <span aria-hidden="true" className={`caret ${blink ? "caret-blink" : ""}`} />
      </span>
      {product && (
        <>
          <span aria-hidden="true" className="font-normal text-faint">
            /
          </span>
          <span className="text-muted">{product.toLowerCase()}</span>
        </>
      )}
    </span>
  );
}
