const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="w-10 h-10 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);

export default LoadingSpinner;
