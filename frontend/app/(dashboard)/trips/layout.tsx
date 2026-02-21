import React from 'react';
import type { TripsLayoutProps } from './_types';

export default function TripsLayout({ children, modal }: TripsLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
