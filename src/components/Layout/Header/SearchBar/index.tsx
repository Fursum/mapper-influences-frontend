import { Magnify } from "@components/SvgComponents";
import { MaxNameLength } from "@libs/consts/sizes";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { useRouter } from "next/router";
import { FC, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

import styles from "./styles.module.scss";

type Props = {
  className?: string;
};

const SearchBar: FC<Props> = ({ className }) => {
  const router = useRouter();
  const containerRef = useRef(null);
  const [isSelected, setIsSelected] = useState(false);

  // Close search bar on mobile
  useOnClickOutside(containerRef, () => setIsSelected(false));

  const searchUser = (query: string) => {
    router.push("/profile/" + query);
    // TODO: Search user service
    console.log(query);
  };

  const debouncedSearch = AwesomeDebouncePromise(searchUser, 500);

  const handleChange = (query: string) => {
    // TODO: Display loading indicator

    debouncedSearch(query);
  };

  const wrapperClass = `${styles.searchBorder} ${className} ${
    isSelected ? styles.isSelected : ""
  }`;

  return (
    <div className={wrapperClass}>
      <div className={styles.searchBar} ref={containerRef}>
        <input
          onChange={(e) => handleChange(e.target.value)}
          placeholder={"Search User"}
          maxLength={MaxNameLength}
        />
        <button
          className={styles.magnifyButton}
          onClick={() => setIsSelected(true)}
        >
          <Magnify className={styles.magnifySvg} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
