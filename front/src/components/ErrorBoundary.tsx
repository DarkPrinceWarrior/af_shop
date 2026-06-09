import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere in the tree so a single broken view does
 * not white-screen the whole SPA.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface to the console (and any attached monitoring) for diagnostics.
    console.error('Unhandled UI error:', error, info);
  }

  private handleReload = (): void => {
    window.location.assign('/');
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="m-0 font-display text-2xl font-medium tracking-tight">
            Something went wrong · ستونزه رامنځته شوه · 出错了
          </h1>
          <p className="m-0 max-w-md text-sm text-muted-foreground">
            The page failed to load. Please reload.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
