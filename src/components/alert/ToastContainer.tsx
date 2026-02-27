import { useAlertStore } from '@/stores/alertStore';
import Toast from './Toast';

const ToastContainer = () => {
  const alerts = useAlertStore((s) => s.alerts);

  if (alerts.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2 pointer-events-none">
      {alerts.map((alert) => (
        <Toast key={alert.id} alert={alert} />
      ))}
    </div>
  );
};

export default ToastContainer;
