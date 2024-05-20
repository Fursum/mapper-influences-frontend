import {
  type FC,
  type FormEvent,
  type MouseEvent,
  useCallback,
  useState,
} from 'react';
import { toast } from 'react-toastify';

import Modal from '@components/SharedComponents/Modal';
import { InfluenceTypeEnum, convertFromInfluence } from '@libs/enums';
import {
  type AddInfluenceRequest,
  useAddInfluenceMutation,
  useDeleteInfluenceMutation,
} from '@services/influence';
import { useGlobalTheme } from '@states/theme';

import EditableDescription from '../../EditableDescription';
import InfluenceType from '../../InfluenceList/InfluenceType';

import styles from './style.module.scss';

type Props = {
  userId: string | number;
  action: 'add' | 'remove';
  dontShowForm?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

const AddUserButton: FC<Props> = ({
  userId,
  dontShowForm,
  onClick,
  action,
}) => {
  const { theme } = useGlobalTheme();
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<InfluenceTypeEnum>(
    InfluenceTypeEnum.Respect,
  );

  const { mutate: addInfluence, isPending: isAddLoading } =
    useAddInfluenceMutation();
  const { mutate: deleteInfluence, isPending: isDeleteLoading } =
    useDeleteInfluenceMutation();
  const isLoading = isAddLoading || isDeleteLoading;

  const onRemove = () => {
    deleteInfluence(userId, {
      onSettled: () => setShowConfirm(false),
    });
  };

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e); // Used in tutorial
      if (action === 'add' && !dontShowForm) {
        setShowForm(true);
      }
      if (action === 'remove') {
        setShowConfirm(true);
      }
    },
    [action, dontShowForm, onClick],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const body: AddInfluenceRequest = {
        influenced_to: Number(userId),
        type: convertFromInfluence(type),
        description,
      };

      addInfluence(body, {
        onSuccess: () => {
          setShowForm(false);
          toast.success('Influence added.');
        },
        onError: () => toast.error('Could not add influence.'),
      });
    },
    [userId, type, description, addInfluence],
  );

  const resetForm = () => {
    setDescription('');
    setType(InfluenceTypeEnum.Fascination);
    setShowForm(false);
  };

  return (
    <>
      <Modal
        className={styles.modal}
        keepOpen
        showModal={showForm}
        setShowModal={setShowForm}
      >
        <form onSubmit={handleSubmit}>
          <InfluenceType
            hideRemove
            editable
            onChange={async (type) => setType(type)}
            className={styles.influenceType}
          />
          <EditableDescription
            description=""
            placeholder="Add a description for your influence."
            editable={!isAddLoading}
            noSubmitOnChange={(e) => setDescription(e)}
          />
          <div className={styles.buttons}>
            <button type="button" className="cancel" onClick={resetForm}>
              Cancel
            </button>
            <button className="submit" disabled={isAddLoading}>
              {isAddLoading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        className={styles.modal}
        keepOpen
        showModal={showConfirm}
        setShowModal={setShowConfirm}
      >
        <h4>Are you sure you want to delete this influence?</h4>
        <div className={styles.buttons}>
          <button
            type="button"
            className="cancel"
            onClick={() => setShowConfirm(false)}
          >
            Cancel
          </button>
          <button className="danger" onClick={onRemove}>
            Delete
          </button>
        </div>
      </Modal>
      <button
        className={`${
          action === 'add' ? styles.addUser : `${styles.removeUser} danger`
        } ${theme === 'dark' ? styles.dark : styles.light}`}
        disabled={isLoading}
        onClick={handleClick}
      >
        <span>{action === 'add' ? 'Add' : 'Remove'} Influence</span>
      </button>
    </>
  );
};
export default AddUserButton;
