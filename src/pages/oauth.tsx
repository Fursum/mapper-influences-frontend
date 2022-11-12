import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAppDispatch } from "src/redux/hooks";
import { SessionActions } from "src/redux/Slices/session";

const Oauth: NextPage = ({}) => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (router.query.code) {
      setCode(router.query.code.toString());
      dispatch(SessionActions.login());
    }
  }, [router.query, dispatch]);

  return (
    <div>
      <h1>Oauth page</h1>
      <button
        onClick={() => {
          navigator.clipboard
            .writeText(code)
            .then(() => alert("Copied!"))
            .catch(() => alert("Failed to copy."));
        }}
      >
        Copy code
      </button>
      <p style={{ maxWidth: "25rem", wordWrap: "break-word" }}>{code}</p>
    </div>
  );
};

export default Oauth;
