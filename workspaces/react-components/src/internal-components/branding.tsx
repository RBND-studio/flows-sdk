import type { FC } from "react";

type Props = {
  className?: string;
  component: string;
};

export const Branding: FC<Props> = ({ className, component }) => {
  return (
    <div className={`flows_basicsV2_branding_container ${className}`}>
      <a
        className="flows_basicsV2_branding_button"
        href={`https://flows.sh?utm_campaign=powered-by&utm_medium=${component}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Logo />
        Powered by Flows
      </a>
    </div>
  );
};

const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
    >
      <path d="M11.406 3.672C11.01 3 10.461 2.466 9.768 2.082C9.114 1.722 8.349 1.524 7.5 1.5H4.8C3.891 1.5 2.928 1.698 2.235 2.082C1.542 2.466 0.99 3 0.597 3.669C0.201 4.338 0 5.124 0 6.006C0 6.888 0.201 7.659 0.597 8.328C0.99 8.997 1.545 9.534 2.241 9.915C2.94 10.299 3.882 10.5 4.8 10.5H7.5C8.343 10.482 9.12 10.278 9.78 9.915C10.473 9.531 11.022 8.997 11.412 8.328C11.802 7.656 12 6.876 12 6.003C12 5.13 11.799 4.344 11.406 3.672ZM9.09 5.967L8.211 6.846C7.989 7.068 7.686 7.2 7.374 7.2H5.985C5.67 7.2 5.37 7.317 5.148 7.539L4.836 7.8C3.957 8.538 2.616 7.911 2.616 6.765C2.616 6.495 2.724 6.237 2.913 6.048L3.792 5.169C4.014 4.947 4.32 4.8 4.635 4.8H6.024C6.339 4.8 6.636 4.698 6.858 4.476L7.137 4.227C7.995 3.459 9.36 4.05 9.387 5.202V5.25C9.387 5.52 9.282 5.778 9.09 5.967Z" />
    </svg>
  );
};
