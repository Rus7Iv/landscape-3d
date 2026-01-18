type NotificationToastProps = {
  isOpen: boolean;
  tag?: string;
  message: string;
  className?: string;
  role?: "status" | "alert";
  ariaLive?: "polite" | "assertive" | "off";
};

const NotificationToast = ({
  isOpen,
  tag,
  message,
  className,
  role = "status",
  ariaLive = "polite",
}: NotificationToastProps) => {
  const baseClass = "notification-toast";
  const openClass = isOpen ? " is-visible" : "";
  const resolvedClass = className
    ? `${baseClass}${openClass} ${className}`
    : `${baseClass}${openClass}`;

  return (
    <div className={resolvedClass} role={role} aria-live={ariaLive}>
      {tag ? <span className="notification-toast-tag">{tag}</span> : null}
      <span className="notification-toast-copy">{message}</span>
    </div>
  );
};

export default NotificationToast;
