const Spinner = ({
  classNameSpinner = 'm-5 w-8 h-8',
  className = '',
  fullScreen = false,
}: {
  className?: string;
  classNameSpinner?: string;
  fullScreen?: boolean;
}) => {
  return (
    <div
      className={`flex items-center justify-center ${fullScreen ? 'fixed inset-0 z-50 bg-white/80 dark:bg-slate-950/80' : ''} ${className}`}
    >
      <div
        className={` animate-spin rounded-full border-4 border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent ${classNameSpinner}`}
      ></div>
    </div>
  );
};

export default Spinner;
