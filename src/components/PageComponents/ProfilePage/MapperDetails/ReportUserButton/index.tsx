import { type FC, useState } from 'react';

import Modal from '@components/SharedComponents/Modal';
import { faFlag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ReportUserForm from './ReportUserForm';

const ReportUserButton: FC<{ userId: string | number }> = ({ userId }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {modalOpen && (
        <Modal showModal={modalOpen} setShowModal={setModalOpen} keepOpen>
          <ReportUserForm userId={userId} />
        </Modal>
      )}
      <button onClick={() => setModalOpen(true)}>
        <FontAwesomeIcon icon={faFlag} />
      </button>
    </>
  );
};
