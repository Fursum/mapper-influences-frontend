import { Magnify } from "@components/SvgComponents";
import { MaxNameLength } from "@libs/consts";
import { UserBaseResponse } from "@services/user";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

import Results from "./Results";
import styles from "./styles.module.scss";

type Props = {
  className?: string;
};

const SearchBar: FC<Props> = ({ className }) => {
  const router = useRouter();
  const containerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<UserBaseResponse[]>([]);
  const [showResults, setShowResults] = useState(false);

  useOnClickOutside(containerRef, () => setShowResults(false));

  const searchUser = useCallback((query: string) => {
    setResults(
      Array.from(Array(10).keys()).map((_, index) => ({
        user_name: query,
        profile_picture: "https://picsum.photos/200",
        id: index,
        flag: { code: "TR", name: "Türkiye" },
      }))
    );
    // TODO: Search user service
  }, []);

  useEffect(() => {}, [router.pathname]);

  const debouncedSearch = AwesomeDebouncePromise(searchUser, 500);

  const handleChange = (query: string) => {
    // Hide results element if query is empty
    setShowResults(!!query);
    // TODO: Display loading indicator

    debouncedSearch(query);
  };

  const wrapperClass = `${styles.searchBorder} ${className}`;

  return (
    <div className={wrapperClass} ref={containerRef}>
      <div className={styles.searchBar}>
        <input
          onChange={(e) => handleChange(e.target.value)}
          placeholder={"Search User"}
          maxLength={MaxNameLength}
          ref={inputRef}
        />
        <button className={styles.magnifyButton}>
          <Magnify className={styles.magnifySvg} />
        </button>
      </div>
      {showResults && <Results results={results} />}
    </div>
  );
};

export default SearchBar;
