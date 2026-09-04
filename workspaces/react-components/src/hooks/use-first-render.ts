import { useEffect, useState } from "react";

export const useFirstRender = (): boolean => {
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setFirstRender(false);
  }, []);

  return firstRender;
};
