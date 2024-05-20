import type { FC } from 'react';
import { toast } from 'react-toastify';

import AwesomeDebouncePromise from 'awesome-debounce-promise';

import styles from './style.module.scss';

type Props = {
  className?: string;
  description: string;
  placeholder: string;
  label?: string;
  editable?: boolean;
  statusText?: {
    loading?: string;
    success?: string;
    error?: string;
  };
  onChange?: (value: string) => Promise<unknown>;
  noSubmitOnChange?: (value: string) => void;
};
const EditableDescription: FC<Props> = ({
  className,
  description,
  editable,
  label,
  placeholder,
  statusText = {
    error: 'Could not submit.',
    success: 'Submitted successfully.',
    loading: 'Submitting.',
  },
  onChange,
  noSubmitOnChange,
}) => {
  const debouncedSubmit = AwesomeDebouncePromise((value: string) => {
    if (onChange) {
      const loadingToast = toast.loading(statusText?.loading);
      onChange(value)
        .then(() => {
          toast.update(loadingToast, {
            render: statusText?.success,
            type: 'success',
            isLoading: false,
            autoClose: 5000,
          });
        })
        .catch(() =>
          toast.update(loadingToast, {
            render: statusText?.error,
            type: 'error',
            isLoading: false,
            autoClose: 5000,
          }),
        );
    }
  }, 3000);

  return (
    <>
      <textarea
        aria-label={label}
        className={`${className} ${styles.description} ${
          editable ? styles.editable : ''
        }`}
        onChange={(e) => {
          noSubmitOnChange?.(e.currentTarget.value);
          debouncedSubmit(e.currentTarget.value);
        }}
        defaultValue={description}
        placeholder={editable ? placeholder : ''}
        readOnly={!editable}
        disabled={!editable}
      />
    </>
  );
};
export default EditableDescription;
