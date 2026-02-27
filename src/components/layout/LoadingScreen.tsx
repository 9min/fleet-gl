type LoadingScreenProps = {
  message: string;
};

const LoadingScreen = ({ message }: LoadingScreenProps) => {
  return (
    <div className="w-screen h-screen bg-bg-dark flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-accent-cyan font-bold text-3xl tracking-tight">logi-twin</span>
        <span className="text-text-secondary text-sm">3D Logistics Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
        <p className="text-text-secondary text-sm">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
