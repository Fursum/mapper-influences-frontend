import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Oauth: NextPage = ({}) => {
  const router = useRouter();
  const [code, setCode] = useState("");

  useEffect(() => {
    if (router.query.code) setCode(router.query.code.toString());
  }, [router.query]);

  return (
    <div>
      <h1>Oauth page</h1>
      <button
        onClick={() => {
          alert("Copied!");
          navigator.clipboard.writeText(code);
        }}
      >
        Copy code
      </button>
      <p style={{ maxWidth: "25rem", wordWrap: "break-word" }}>{code}</p>
    </div>
  );
};

export default Oauth;
