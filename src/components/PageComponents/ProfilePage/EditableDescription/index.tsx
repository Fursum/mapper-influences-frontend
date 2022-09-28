import { FC } from "react";
import AwesomeDebouncePromise from "awesome-debounce-promise";

import styles from "./style.module.scss";

type Props = {
  className?: string;
  description: string;
  placeholder: string;
  label: string;
  editable?: boolean;
  onChange?: () => void;
};
const EditableDescription: FC<Props> = ({
  className,
  description,
  editable,
  label,
  placeholder,
  onChange,
}) => {
  const submitChanges = (e: string) => {
    console.log(e);

    if (onChange) onChange();
  };

  const debouncedSubmit = AwesomeDebouncePromise(submitChanges, 250);

  return (
    <>
      <textarea
        aria-label={label}
        className={`${className} ${styles.description} ${
          editable ? styles.editable : ""
        }`}
        onChange={(e) => debouncedSubmit(e.target.value)}
        defaultValue={description}
        placeholder={editable ? placeholder : ""}
        readOnly={!editable}
        disabled={!editable}
      />
    </>
  );
};
export default EditableDescription;
