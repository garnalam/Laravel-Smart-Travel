declare module '@react-jvectormap/core' {
  import * as React from 'react';

  export interface VectorMapProps {
    [key: string]: any;
  }

  export const VectorMap: React.ComponentType<VectorMapProps>;
}

declare module '@react-jvectormap/world' {
  export const worldMill: any;
}


