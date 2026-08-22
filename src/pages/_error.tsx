import type { NextPageContext } from 'next';
import Link from 'next/link';

type Props = {
  statusCode?: number;
};

const ErrorPage = ({ statusCode }: Props) => (
  <>
    <h1>Something went wrong!</h1>
    <p>
      {statusCode
        ? `The server responded with a ${statusCode} error.`
        : 'An unexpected error occurred.'}
    </p>
    <p>
      <Link href="/">Return to the home page</Link>
    </p>
  </>
);

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): Props => {
  const statusCode = res?.statusCode ?? err?.statusCode;
  return { statusCode };
};

export default ErrorPage;
