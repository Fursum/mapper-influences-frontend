import { type FC, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import styles from './style.module.scss';

const SUBMIT_DELAY = 3000;

type Props = {
  className?: string;
  description: string;
  placeholder: string;
  label?: string;
  editable?: boolean;
  // Shows loading, success, and error toasts for each submit when set
  statusText?: {
    loading?: string;
    success?: string;
    error?: string;
  };
  // Debounced. Also runs at once on blur and on unmount, so edits are not lost
  onChange?: (value: string) => Promise<unknown>;
  noSubmitOnChange?: (value: string) => void;
};
const EditableDescription: FC<Props> = ({
  className,
  description,
  editable,
  label,
  placeholder,
  statusText,
  onChange,
  noSubmitOnChange,
}) => {
  // Latest props, so the stable flush below never calls a stale onChange
  const latest = useRef({ onChange, statusText });
  useEffect(() => {
    latest.current = { onChange, statusText };
  });

  const timer = useRef<ReturnType<typeof setTimeout>>();
  const pendingValue = useRef<string | null>(null);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const value = pendingValue.current;
    const { onChange, statusText } = latest.current;
    if (value === null || !onChange) return;
    pendingValue.current = null;

    const request = onChange(value);
    if (!statusText) return;

    const loadingToast = toast.loading(statusText.loading);
    request
      .then(() => {
        toast.update(loadingToast, {
          render: statusText.success,
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });
      })
      .catch(() =>
        toast.update(loadingToast, {
          render: statusText.error,
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        }),
      );
  }, []);

  // Submit a pending edit when the user leaves the page
  useEffect(() => flush, [flush]);

  return (
    <>
      <textarea
        aria-label={label}
        className={`${className} ${styles.description} ${
          editable ? styles.editable : ''
        }`}
        onChange={(e) => {
          const { value } = e.currentTarget;
          noSubmitOnChange?.(value);
          if (!onChange) return;
          pendingValue.current = value;
          clearTimeout(timer.current);
          timer.current = setTimeout(flush, SUBMIT_DELAY);
        }}
        onBlur={flush}
        defaultValue={description}
        placeholder={editable ? placeholder : ''}
        readOnly={!editable}
        disabled={!editable}
        maxLength={500}
      />
    </>
  );
};
export default EditableDescription;
