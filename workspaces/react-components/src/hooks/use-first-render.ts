import { useEffect, useState } from "react";

export const useFirstRender = (): boolean => {
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    setFirstRender(false);
  }, []);

  return firstRender;
};
