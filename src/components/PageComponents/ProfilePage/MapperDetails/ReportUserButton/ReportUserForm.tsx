import { type FC, useState } from 'react';

import { faBug, faQuestion, faSkull } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUserBio } from '@services/user';

import SmallUser from '../../../../SharedComponents/Activity/SmallUser';

import LargeButtonStyles from '@components/SharedComponents/ContributeButtons/style.module.scss';

enum ReportTypeEnum {
  Toxicity = 'Toxicity',
  Abuse = 'Abuse',
  Other = 'Other',
  None = 'None',
}

const ReportUserForm: FC<{ userId: string | number }> = ({ userId }) => {
  const [reportType, setReportType] = useState<ReportTypeEnum>(
    ReportTypeEnum.None,
  );
  const [additionalInfo, setAdditionalInfo] = useState('');

  const { data: reportedUser } = useUserBio(userId);

  if (!reportedUser) return <div>Loading...</div>;

  return (
    <form>
      <h2>Submit a report</h2>
      <p>
        Reported user: <SmallUser user={reportedUser} />
      </p>
      <div>
        <div>
          <button className={LargeButtonStyles.button}>
            <FontAwesomeIcon icon={faSkull} />
          </button>
          <span>Toxicity</span>
        </div>
        <div>
          <button className={LargeButtonStyles.button}>
            <FontAwesomeIcon icon={faBug} />
          </button>
          <span>Bug Abuse</span>
        </div>
        <div>
          <button className={LargeButtonStyles.button}>
            <FontAwesomeIcon icon={faQuestion} />
          </button>
          <span>Other</span>
        </div>
      </div>
      <div>
        <button>Cancel</button>
        <button>Submit</button>
      </div>
    </form>
  );
};

export default ReportUserForm;
