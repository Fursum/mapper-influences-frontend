import { FC } from "react";
import AwesomeDebouncePromise from "awesome-debounce-promise";

import styles from "./profilePage.module.scss";

type Props = {
  className?: string;
  description: string;
  editable?: boolean;
  onChange?: () => void;
};
const EditableDescription: FC<Props> = ({
  className,
  description,
  editable,
  onChange,
}) => {
  const submitChanges = (e: string) => {
    console.log(e);

    if (onChange) onChange();
  };

  const debouncedSubmit = AwesomeDebouncePromise(submitChanges, 250);

  return (
    <textarea
      className={`${className} ${styles.description} ${
        editable ? styles.editable : ""
      }`}
      onChange={(e) => debouncedSubmit(e.target.value)}
      defaultValue={description}
      readOnly={editable}
    />
  );
};
export default EditableDescription;
