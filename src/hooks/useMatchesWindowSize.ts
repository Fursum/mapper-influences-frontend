import AwesomeDebouncePromise from "awesome-debounce-promise";
import { useCallback, useEffect, useState } from "react";

/**
 * Changes state when matching width on resize
 */
const useMatchesWindowSize = (width = "60rem") => {
  const [matches, setMatches] = useState<boolean>(false);

  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const debounceSetState = useCallback(
    () =>
      AwesomeDebouncePromise(
        () => {
          setMatches(getMatches(`(max-width: ${width})`));
        },
        //Add random delay to updates
        50 + Math.random() * 15
      )(),
    [width, getMatches]
  );

  useEffect(() => {
    window.addEventListener("resize", debounceSetState);
    return () => {
      window.removeEventListener("resize", debounceSetState);
    };
  }, [debounceSetState]);

  return matches;
};

export default useMatchesWindowSize;
