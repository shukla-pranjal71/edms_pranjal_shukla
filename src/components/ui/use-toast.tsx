
// Import from a completely different implementation
import {
  ToastActionElement,
  ToastProps
} from "@/components/ui/toast";

// Use createContext to create a toast context
import * as React from "react";

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
  DISMISS_ALL_TOASTS: "DISMISS_ALL_TOASTS",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["DISMISS_ALL_TOASTS"];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      // Dismiss all toasts
      if (toastId === undefined) {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
            open: false,
          })),
        };
      }

      // Dismiss specific toast
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t, open: false } : t
        ),
      };
    }

    case actionTypes.REMOVE_TOAST: {
      const { toastId } = action;

      // Remove all toasts
      if (toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }

      // Remove specific toast
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      };
    }

    case actionTypes.DISMISS_ALL_TOASTS: {
      return {
        ...state,
        toasts: state.toasts.map((t) => ({
          ...t,
          open: false,
        })),
      };
    }
  }
};

const ToastContext = React.createContext<{
  toasts: ToasterToast[];
  toast: (props: Omit<ToasterToast, "id">) => string;
  dismiss: (toastId?: string) => void;
  dismissAll: () => void;
  remove: (toastId?: string) => void;
}>({
  toasts: [],
  toast: () => "",
  dismiss: () => {},
  dismissAll: () => {},
  remove: () => {},
});

export function useToast() {
  const context = React.useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (!toast.open) {
        if (toastTimeouts.has(toast.id)) {
          return;
        }

        const timeout = setTimeout(() => {
          dispatch({
            type: actionTypes.REMOVE_TOAST,
            toastId: toast.id,
          });
        }, TOAST_REMOVE_DELAY);

        toastTimeouts.set(toast.id, timeout);
      }
    });
  }, [state.toasts]);

  const toast = React.useCallback(
    (props: Omit<ToasterToast, "id">) => {
      const id = genId();

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
        },
      });

      return id;
    },
    [dispatch]
  );

  const dismiss = React.useCallback(
    (toastId?: string) => {
      dispatch({
        type: actionTypes.DISMISS_TOAST,
        toastId,
      });
    },
    [dispatch]
  );

  const dismissAll = React.useCallback(
    () => {
      dispatch({
        type: actionTypes.DISMISS_ALL_TOASTS,
      });
    },
    [dispatch]
  );

  const remove = React.useCallback(
    (toastId?: string) => {
      dispatch({
        type: actionTypes.REMOVE_TOAST,
        toastId,
      });
    },
    [dispatch]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts: state.toasts,
        toast,
        dismiss,
        dismissAll,
        remove,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}
