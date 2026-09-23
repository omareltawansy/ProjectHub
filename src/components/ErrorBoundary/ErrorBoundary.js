import React from 'react';

// Catches render errors anywhere below it so one broken page doesn't blank the whole app.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" style={{ maxWidth: 480, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          This page hit an unexpected error. Reloading usually fixes it.
        </p>
        <button
          type="button"
          className="login-button"
          onClick={() => { window.location.href = '/'; }}
        >
          Back to home
        </button>
      </div>
    );
  }
}
