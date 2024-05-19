import { type FC, useEffect, useRef } from 'react';

import { useGlobalTooltip } from 'src/states/globalTooltip';

import styles from './style.module.scss';

const Tooltip: FC = () => {
  const ref = useRef<HTMLElement>(null);
  const element = ref.current;

  const { text, parent, isActive, deactivateTooltip } = useGlobalTooltip();

  useEffect(() => {
    if (!isActive || !element) return;

    element.style.opacity = '1';
    // Spans work but buttons dont with this 🤷‍♀️
    if (parent)
      parent.onmouseleave = () => {
        element.style.opacity = '0';
        deactivateTooltip();
      };
  }, [isActive, deactivateTooltip, parent, element]);

  useEffect(() => {
    function handleMouse(e: MouseEvent) {
      if (!element) return;
      const padding = 8;
      const deadzone = 16;

      // X axis
      if (element.clientWidth / 2 + e.pageX + deadzone > window.innerWidth)
        element.style.left = `${e.pageX - element.clientWidth - padding}px`;
      else element.style.left = `${e.pageX - element.clientWidth / 2}px`;

      // Y axis
      if (e.clientY - element.clientHeight - deadzone <= 0)
        element.style.top = `${e.pageY + padding}px`;
      else element.style.top = `${e.pageY - element.clientHeight - padding}px`;
    }

    document.addEventListener('mousemove', handleMouse);
    return () => {
      document.removeEventListener('mousemove', handleMouse);
    };
  }, [element]);

  return (
    <span
      className={`${styles.tooltip} ${isActive ? styles.active : ''}`}
      ref={ref}
    >
      {text}
    </span>
  );
};

export default Tooltip;
