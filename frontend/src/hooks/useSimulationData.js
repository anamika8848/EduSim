import { useEffect } from 'react';

export function useSimulationData(onSimulationData, data) {
  useEffect(() => {
    if (onSimulationData) {
      onSimulationData(data);
    }
  }, [onSimulationData, JSON.stringify(data)]);
}
