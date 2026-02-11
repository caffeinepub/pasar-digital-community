/**
 * Top-level error boundary that catches unexpected render/initialization errors
 * Renders TopLevelErrorFallback instead of allowing a blank screen
 */

import { Component, ReactNode } from 'react';
import TopLevelErrorFallback from './TopLevelErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class TopLevelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Top-level error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <TopLevelErrorFallback />;
    }

    return this.props.children;
  }
}
