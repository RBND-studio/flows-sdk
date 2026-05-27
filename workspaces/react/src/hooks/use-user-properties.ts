import type { UserProperties } from "@flows/shared";
import { isUserPropertiesEqual } from "@flows/shared";
import { useEffect, useRef, useState } from "react";

// Hook that changes userProperties object only when the values actually change
// to avoid unnecessary re-renders and effects when the object reference changes
export const useUserProperties = (userProperties: UserProperties): UserProperties => {
  const [userPropertiesState, setUserPropertiesState] = useState(userProperties);
  const userPropertiesStateRef = useRef(userPropertiesState);
  userPropertiesStateRef.current = userPropertiesState;

  useEffect(() => {
    const stateValue = userPropertiesStateRef.current;
    if (!isUserPropertiesEqual(stateValue, userProperties)) {
      setUserPropertiesState(userProperties);
    }
  }, [userProperties]);

  return userPropertiesState;
};
