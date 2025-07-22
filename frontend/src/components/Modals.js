import React from 'react';
import {
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  XCircleIcon as XCircleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
} from '@heroicons/react/24/solid';

// Modern Confirmation Dialog
export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  type = 'warning' // warning, danger, info
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-400',
      icon: ExclamationTriangleIconSolid,
      confirmBg: 'bg-amber-600 hover:bg-amber-700',
      confirmFocus: 'focus:ring-amber-500'
    },
    danger: {
      bgColor: 'bg-red-50',
      iconColor: 'text-red-400',
      icon: XCircleIconSolid,
      confirmBg: 'bg-red-600 hover:bg-red-700',
      confirmFocus: 'focus:ring-red-500'
    },
    info: {
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-400',
      icon: InformationCircleIconSolid,
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      confirmFocus: 'focus:ring-blue-500'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-custom overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-modal-fade">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto animate-modal-zoom">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${config.bgColor} sm:mx-0 sm:h-12 sm:w-12`}>
              <IconComponent className={`h-6 w-6 ${config.iconColor}`} aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 ${config.confirmBg} ${config.confirmFocus} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Notification Toast
export const NotificationToast = ({ 
  notifications, 
  removeNotification 
}) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onRemove }) => {
  const { id, type, title, message, duration = 5000 } = notification;

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const typeConfig = {
    success: {
      bgColor: 'bg-green-50 border-green-200',
      iconColor: 'text-green-400',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      icon: CheckCircleIconSolid,
    },
    error: {
      bgColor: 'bg-red-50 border-red-200',
      iconColor: 'text-red-400',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      icon: XCircleIconSolid,
    },
    warning: {
      bgColor: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-800',
      messageColor: 'text-amber-700',
      icon: ExclamationTriangleIconSolid,
    },
    info: {
      bgColor: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
      icon: InformationCircleIconSolid,
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div className={`max-w-sm w-full ${config.bgColor} border rounded-xl shadow-lg pointer-events-auto animate-slide-in-right`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${config.titleColor}`}>
              {title}
            </p>
            {message && (
              <p className={`mt-1 text-sm ${config.messageColor}`}>
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex rounded-md ${config.messageColor} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
              onClick={() => onRemove(id)}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState([]);

  const addNotification = React.useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = { 
      id, 
      ...notification,
      duration: notification.duration ?? 5000
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = React.useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = React.useCallback((title, message, duration) => {
    return addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const showError = React.useCallback((title, message, duration) => {
    return addNotification({ type: 'error', title, message, duration });
  }, [addNotification]);

  const showWarning = React.useCallback((title, message, duration) => {
    return addNotification({ type: 'warning', title, message, duration });
  }, [addNotification]);

  const showInfo = React.useCallback((title, message, duration) => {
    return addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}; 