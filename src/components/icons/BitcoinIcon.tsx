export const BitcoinIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c1.77-.45 2.34-1.48 2.34-2.54 0-1.43-.94-2.44-2.64-2.7V4.5h-1.5v1.34c-.39 0-.79.01-1.2.03V4.5H7.8v1.5h-1.5v1.5h.75c.55 0 .75.2.75.75v5.5c0 .55-.2.75-.75.75H6.3v1.5h1.5v1.5h1.5v-1.47c.43.02.84.03 1.2.03V18h1.5v-1.4c2.1-.21 3.5-1.21 3.5-3.05 0-1.53-.88-2.52-2.69-2.91zm-1.81-3.28c.96 0 1.71.27 1.71 1.15 0 .84-.67 1.19-1.71 1.19h-.2V7.86h.2zm.32 6.97h-.52V12.3h.52c1.23 0 1.98.41 1.98 1.3 0 .93-.75 1.23-1.98 1.23z" />
  </svg>
);

export const BitcoinSymbol = ({ className = "" }: { className?: string }) => (
  <span className={`font-bold ${className}`}>₿</span>
);

export const StacksLogo = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
    />
  </svg>
);
