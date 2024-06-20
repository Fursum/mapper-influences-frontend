import type { ComponentProps, FC } from 'react';

import Link from 'next/link';

/** This component is used to disable links for the unauthorized users */
const ConditionalLink: FC<
  ComponentProps<typeof Link> & {
    disabled?: boolean;
  }
> = ({ href, children, disabled, ...props }) => {
  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  if (disabled) return <div {...(props as any)}>{children}</div>;
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
};

export default ConditionalLink;
