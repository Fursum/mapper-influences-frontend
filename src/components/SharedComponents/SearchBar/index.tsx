import { useState, useEffect, FC } from "react";
import Select, { MultiValue } from "react-select";

import styles from "./styles.module.scss";

type Option = {
  readonly value: number;
  readonly label: string;
};

type Props = {
  className?: string;
}

const SearchBar:FC<Props> = ({className}) => {
  const [selectedMappers, setSelectedMappers] = useState<MultiValue<Option>>(
    []
  );
  const [allMappers, setAllMappers] = useState<MultiValue<Option>>([]);

  useEffect(() => {
    //TODO: implement dynamic search for mappers
    setAllMappers([
      { value: 31, label: "Fursum" },
      { value: 69, label: "Skytuna" },
    ]);
  }, []);

  const handleMapperChange = (mappers: MultiValue<Option>) => {
    setSelectedMappers(mappers);
  };

  return (
    <div className={`${styles.searchBar} ${className}`}>
      <Select
        instanceId="searchBar"
        closeMenuOnSelect={false}
        value={selectedMappers}
        options={allMappers}
        onChange={handleMapperChange}
        isMulti
      />
    </div>
  );
}

export default SearchBar;