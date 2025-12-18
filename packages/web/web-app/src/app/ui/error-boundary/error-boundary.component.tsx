/** biome-ignore-all lint/suspicious/noExplicitAny: Type is ok here */
import React from 'react'
// import styled from 'styled-components';

/* eslint-disable-next-line */
export interface ErrorBoundaryProps {
  fallback: any
  children?: any
}

// const StyledErrorBoundary = styled.div`
//   color: pink;
// `;

// export function ErrorBoundary(props: ErrorBoundaryProps) {
//   return (
//     <StyledErrorBoundary>
//       <h1>Welcome to ErrorBoundary!</h1>
//     </StyledErrorBoundary>
//   );
// }

// export default ErrorBoundary;

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state: { hasError: boolean }
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: { componentStack: any }) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    console.error(error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback
    }

    return this.props.children
  }
}
