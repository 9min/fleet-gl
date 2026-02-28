import { useTranslation } from 'react-i18next';

type ConnectionStatusProps = {
  connected: boolean;
};

const ConnectionStatus = ({ connected }: ConnectionStatusProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex items-center justify-center">
        {connected && (
          <span className="absolute w-2 h-2 rounded-full bg-accent-green animate-ping opacity-40" />
        )}
        <span className={`relative w-1.5 h-1.5 rounded-full ${connected ? 'bg-accent-green' : 'bg-accent-red'}`} />
      </div>
      <span className="text-[10px] text-text-secondary font-mono hidden sm:inline">
        {connected ? t('connection.connected') : t('connection.disconnected')}
      </span>
    </div>
  );
};

export default ConnectionStatus;
