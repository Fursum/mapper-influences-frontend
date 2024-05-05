import AwesomeDebouncePromise from "awesome-debounce-promise";
import type { ChangeEvent, ChangeEventHandler, FC } from "react";
import { toast } from "react-toastify";

import styles from "./style.module.scss";

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
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => Promise<any>;
  noSubmitOnChange?: ChangeEventHandler<HTMLTextAreaElement>;
};
const EditableDescription: FC<Props> = ({
  className,
  description,
  editable,
  label,
  placeholder,
  statusText = {
    error: "Could not submit.",
    success: "Successfully submitted.",
    loading: "Submitting.",
  },
  onChange,
  noSubmitOnChange,
}) => {
  const debouncedSubmit = AwesomeDebouncePromise(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        const loadingToast = toast.loading(statusText?.loading);
        onChange(e)
          .then(() => {
            toast.update(loadingToast, {
              render: statusText?.success,
              type: toast.TYPE.SUCCESS,
              isLoading: false,
              autoClose: 5000,
            });
          })
          .catch(() =>
            toast.update(loadingToast, {
              render: statusText?.error,
              type: toast.TYPE.ERROR,
              isLoading: false,
              autoClose: 5000,
            })
          );
      }
    },
    500
  );

  return (
    <>
      <textarea
        aria-label={label}
        className={`${className} ${styles.description} ${
          editable ? styles.editable : ""
        }`}
        onChange={(e) => {
          noSubmitOnChange && noSubmitOnChange(e);
          debouncedSubmit(e);
        }}
        defaultValue={description}
        placeholder={editable ? placeholder : ""}
        readOnly={!editable}
        disabled={!editable}
      />
    </>
  );
};
export default EditableDescription;
