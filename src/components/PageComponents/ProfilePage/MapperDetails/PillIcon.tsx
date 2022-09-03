import { FC } from "react";
import { ProfileInfoIcons } from "@libs/types/influence";
import {
  Followers,
  Graved,
  Influences,
  Loved,
  Pending,
  Ranked,
  Subscribers,
} from "@components/SvgComponents";

type Props = { iconName: ProfileInfoIcons; className?: string; color?: string };
const PillIcon: FC<Props> = ({ iconName, className, color }) => {
  let Selected: FC<any>;
  switch (iconName) {
    case "Followers":
      Selected = Followers;
      break;
    case "Graved":
      Selected = Graved;
      break;
    case "Influences":
      Selected = Influences;
      break;
    case "Loved":
      Selected = Loved;
      break;
    case "Pending":
      Selected = Pending;
      break;
    case "Ranked":
      Selected = Ranked;
      break;
    case "Subscribers":
      Selected = Subscribers;
      break;
    default:
      return <span>?</span>;
  }

  return <Selected className={className || ""} color={color} />;
};
export default PillIcon;
