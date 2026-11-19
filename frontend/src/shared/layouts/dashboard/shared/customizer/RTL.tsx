import React, { useEffect } from 'react';

interface RTLType {
  children: React.ReactNode;
  direction: string;
}

const RTL = ({ children, direction }: RTLType) => {
  useEffect(() => {
    document.dir = direction;
    document.documentElement.dir = direction;
  }, [direction]);

  return <>{children}</>;
};

export default RTL;
