import React from 'react';

interface RoutesLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function RoutesLayout({ children, modal }: RoutesLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
