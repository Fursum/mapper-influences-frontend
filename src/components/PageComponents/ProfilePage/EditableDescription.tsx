import { ChangeEvent } from "react";
import { FC } from "react";
import { DebounceInput } from "react-debounce-input";

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
  const submitChanges = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);

    if (onChange) onChange();
  };

  return (
    <DebounceInput
      className={`${className} ${styles.description} ${editable ? styles.editable : ""}`}
      element={"textarea"}
      onChange={submitChanges}
      value={description}
      debounceTimeout={1000}
      readOnly={!editable}
    />
  );
};
export default EditableDescription;
