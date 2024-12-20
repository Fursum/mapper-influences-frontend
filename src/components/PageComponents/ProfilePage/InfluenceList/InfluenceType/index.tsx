import { type FC, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Modal from '@components/SharedComponents/Modal';
import Arrow from '@components/SvgComponents/Arrow';
import { InfluenceTypeEnum, convertToInfluence } from '@libs/enums';
import type { Influence } from '@libs/types/rust';
import { useDeleteInfluenceMutation } from '@services/influence/deleteInfluence';
import { useOnClickOutside } from 'usehooks-ts';

import styles from './style.module.scss';

type Props = {
  className?: string;
  editable?: boolean;
  loading?: boolean;
  influenceData?: Influence;
  hideRemove?: boolean;
  onChange?: (type: InfluenceTypeEnum) => Promise<unknown>;
  noSubmitOnChange?: (type: InfluenceTypeEnum) => void;
};

const InfluenceType: FC<Props> = ({
  className,
  editable,
  loading,
  influenceData,
  hideRemove,
  onChange,
  noSubmitOnChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<InfluenceTypeEnum>(
    convertToInfluence(influenceData?.influence_type || 1),
  );

  const ref = useRef(null);
  useOnClickOutside(ref, () => {
    if (isOpen) setIsOpen(false);
  });

  const { mutate: removeInfluence, isPending } = useDeleteInfluenceMutation();

  const onRemove = () => {
    setIsLoading(true);
    removeInfluence(influenceData?.user.id || 0, {
      onSettled: () => {
        setIsLoading(false);
        setIsModalOpen(false);
      },
    });
  };

  const handleChange = (newType: InfluenceTypeEnum) => {
    setSelectedType(newType);
    noSubmitOnChange?.(newType);
    if (onChange) {
      setIsLoading(true);
      onChange(newType)
        .catch(() => {
          setSelectedType(selectedType);
          toast.error('Failed to update influence level.');
        })
        .finally(() => setIsLoading(false));
    }
  };

  const dropdownClass = `${styles.dropdown} ${isOpen ? styles.open : ''} ${
    isLoading || loading ? styles.disabled : ''
  }`;

  if (editable)
    return (
      <>
        <Modal
          setShowModal={setIsModalOpen}
          showModal={isModalOpen}
          className={`${styles.modal}`}
        >
          <h4>Are you sure you want to delete this influence?</h4>
          <div>
            <button
              className="cancel"
              disabled={isLoading}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button className="danger" disabled={isLoading} onClick={onRemove}>
              Delete
            </button>
          </div>
        </Modal>
        <div
          className={`${dropdownClass} ${className}`}
          ref={ref}
          onClick={() => !isLoading && setIsOpen((t) => !t)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setIsOpen((t) => !t);
          }}
        >
          <span>
            {selectedType}{' '}
            <Arrow className={styles.arrow} color="var(--textColor)" />
          </span>

          {isOpen && !isPending && (
            <div className={styles.optionsCont}>
              {DROPDOWN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange(option.label)}
                  disabled={option.label === selectedType}
                >
                  {isPending ? '...' : option.label}
                </button>
              ))}
              {!hideRemove && (
                <button
                  style={{ color: 'red' }}
                  onClick={() => {
                    setIsOpen(false);
                    setIsModalOpen(true);
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </>
    );

  return (
    <div className={styles.nonEditable}>
      <InfluenceText type={selectedType} />
    </div>
  );
};
export default InfluenceType;

const DROPDOWN_OPTIONS = [
  { label: InfluenceTypeEnum.Respect, value: 1 },
  { label: InfluenceTypeEnum.Fascination, value: 4 },
  { label: InfluenceTypeEnum.Implementation, value: 7 },
];

const InfluenceText: FC<{ type: InfluenceTypeEnum }> = ({ type }) => {
  switch (type) {
    case InfluenceTypeEnum.Respect:
      return <>Respects</>;
    case InfluenceTypeEnum.Fascination:
      return (
        <>
          Fascinated <span>by</span>
        </>
      );
    case InfluenceTypeEnum.Implementation:
      return (
        <>
          Implements <span>from</span>
        </>
      );
    default:
      return <>Respect</>;
  }
};
