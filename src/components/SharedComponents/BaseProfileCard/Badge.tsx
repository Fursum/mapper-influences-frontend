import type { Group } from "@libs/types/IOsuApi";
import type { FC } from "react";
import { useGlobalTooltip } from "src/states/globalTooltip";
import styles from "./style.module.scss";

type Props = { group: Group };
const Badge: FC<Props> = ({ group }) => {
  const { activateTooltip } = useGlobalTooltip();

  return (
    <span
      className={styles.badge}
      style={{ color: group.colour, borderColor: group.colour }}
      onMouseEnter={(e) => activateTooltip(group.name, e.currentTarget)}
    >
      {group.short_name}
    </span>
  );
};
export default Badge;
