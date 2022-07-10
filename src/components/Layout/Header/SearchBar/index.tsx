import { Magnify } from "@components/SvgComponents";
import { MaxNameLength } from "@libs/consts/sizes";
import { FC, ChangeEvent } from "react";
import { DebounceInput } from "react-debounce-input";

import styles from "./styles.module.scss";

type Props = {
  className?: string;
};

const SearchBar: FC<Props> = ({ className }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // TODO: Trigger search
    console.log(e.target.value);
  };

  return (
    <div className={`${styles.searchBar} ${className}`}>
      <DebounceInput
        onChange={handleChange}
        debounceTimeout={250}
        placeholder={"Search User"}
        maxLength={MaxNameLength}
      />
      <Magnify className={styles.magnify} />
    </div>
  );
};

export default SearchBar;
