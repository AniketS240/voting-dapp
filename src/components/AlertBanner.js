function AlertBanner({ type = "info", message, onDismiss }) {
  if (!message) return null;

  const cls =
    type === "success"
      ? "alert alert-success"
      : type === "error"
        ? "alert alert-error"
        : "alert alert-info";

  return (
    <div className={cls} role="alert">
      <div className="alert-message">{message}</div>
      {onDismiss ? (
        <button className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      ) : null}
    </div>
  );
}

export default AlertBanner;

