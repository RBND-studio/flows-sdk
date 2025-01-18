"use client";

import { getPathname } from "@flows/shared";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";

const INTERVAL_MS = 250;

const _usePathname = (): string | undefined => {
  const [pathname, setPathname] = useState<string>();
  const pathnameRef = useRef<string | undefined>(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const newPathname = getPathname();
      if (pathnameRef.current !== newPathname) {
        setPathname(newPathname);
      }
    }, INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  });

  return pathname;
};

type IPathnameContext = string | undefined;
const PathnameContext = createContext<IPathnameContext>(undefined);
export const usePathname = (): IPathnameContext => useContext(PathnameContext);

interface Props {
  children?: ReactNode;
}
export const PathnameProvider: FC<Props> = ({ children }) => {
  const pathname = _usePathname();

  return <PathnameContext.Provider value={pathname}>{children}</PathnameContext.Provider>;
};
