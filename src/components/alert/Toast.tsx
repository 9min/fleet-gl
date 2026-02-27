import { useEffect, useCallback } from 'react';
import { useAlertStore, type AlertItem } from '@/stores/alertStore';

type ToastProps = {
  alert: AlertItem;
};

const TYPE_COLORS: Record<string, string> = {
  info: '#00D4FF',
  warning: '#FFB800',
  success: '#00FF88',
  error: '#FF4757',
};

const TYPE_ICONS: Record<string, string> = {
  info: 'i',
  warning: '!',
  success: '\u2713',
  error: '\u2715',
};

const Toast = ({ alert }: ToastProps) => {
  const dismissAlert = useAlertStore((s) => s.dismissAlert);
  const markDismissing = useAlertStore((s) => s.markDismissing);

  const handleDismiss = useCallback(() => {
    markDismissing(alert.id);
    setTimeout(() => dismissAlert(alert.id), 300);
  }, [alert.id, dismissAlert, markDismissing]);

  useEffect(() => {
    const timer = setTimeout(handleDismiss, 5000);
    return () => clearTimeout(timer);
  }, [handleDismiss]);

  const color = TYPE_COLORS[alert.type] ?? TYPE_COLORS.info;

  return (
    <div
      className={`glass-panel px-3 py-2 flex items-start gap-2 max-w-xs pointer-events-auto cursor-pointer ${alert.dismissing ? 'animate-toast-out' : 'animate-toast-in'}`}
      onClick={handleDismiss}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {TYPE_ICONS[alert.type]}
      </div>
      <p className="text-xs text-text-primary leading-relaxed">{alert.message}</p>
    </div>
  );
};

export default Toast;
