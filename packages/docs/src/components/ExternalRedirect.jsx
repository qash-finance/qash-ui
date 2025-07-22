import React, { useEffect } from "react";
import { useHistory } from "@docusaurus/router";

export default function ExternalRedirect({ to }) {
  const history = useHistory();

  useEffect(() => {
    const newWindow = window.open(to, "_blank");
    if (newWindow) {
      history.push("/");
    }
  }, []);

  return (
    <div>
      <p>
        Opening external link... If nothing happens,{" "}
        <a href={to} target="_blank">
          click here
        </a>
        .
      </p>
    </div>
  );
}
