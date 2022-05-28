import { FC } from "react";
import { ProfileInfoIcons } from "@libs/types/influence";
import { Followers, Graved, Loved, Pending, Ranked, Subscribers } from "@components/svgComponents";


type Props = { iconName: ProfileInfoIcons; className: string };
const PillIcon: FC<Props> = ({ iconName, className }) => {
  let Selected: FC<any>;
  switch (iconName) {
    case "Followers":
      Selected = Followers;
      break;
    case "Graved":
      Selected = Graved;
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

  return <Selected className={className} />;
};
export default PillIcon;
