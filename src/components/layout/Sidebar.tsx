import type { ReactNode } from 'react';

type SidebarProps = {
  children: ReactNode;
};

const Sidebar = ({ children }: SidebarProps) => {
  return <div className="flex flex-col gap-3">{children}</div>;
};

export default Sidebar;
