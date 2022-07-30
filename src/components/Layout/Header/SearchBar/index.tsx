import { Magnify } from "@components/SvgComponents";
import { MaxNameLength } from "@libs/consts/sizes";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { useRouter } from "next/router";
import { FC } from "react";

import styles from "./styles.module.scss";

type Props = {
  className?: string;
};

const SearchBar: FC<Props> = ({ className }) => {
  const router = useRouter()

  const searchUser = (query: string) => {
    router.push("/profile/" + query)
    // TODO: Search user service
    console.log(query);
  };

  const debouncedSearch = AwesomeDebouncePromise(searchUser, 500);

  const handleChange = (query: string) => {
    // TODO: Display loading indicator

    debouncedSearch(query);
  };

  return (
    <div className={`${styles.searchBar} ${className}`}>
      <input
        onChange={(e) => handleChange(e.target.value)}
        placeholder={"Search User"}
        maxLength={MaxNameLength}
      />
      <Magnify className={styles.magnify} />
    </div>
  );
};

export default SearchBar;
