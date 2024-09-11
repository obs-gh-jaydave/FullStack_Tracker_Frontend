import React, { useState } from 'react';
import './App.css';
import { faroInstance } from './index';

function App() {
  const [count, setCount] = useState(0);

  const handleClick = async () => {
    // Log the button click
    faroInstance.api.pushLog([{
      level: 'info',
      message: 'User clicked the button',
      context: { interaction: 'buttonClick' }
    }]);
  

    try {
      // Start a new span
      const tracer = faroInstance.api.getOTEL().trace.getTracer('frontend-app');
      const span = tracer.startSpan('button-click');
      const spanContext = span.spanContext();
      const traceparent = `00-${spanContext.traceId}-${spanContext.spanId}-01`;

      // Log span attributes similar to backend logs
      console.log('Span Attributes:', {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
        traceFlags: spanContext.traceFlags,
        kind: span.kind,
        name: span.name,
        attributes: span.attributes,  // If you add attributes
        events: span.events,
        startTime: span.startTime,
        duration: span.duration,
        resource: span.resource,  // Resource associated with span (e.g., service name)
      });

      // Make fetch request with trace context
      const response = await fetch('http://localhost:3001/api/data', {
        headers: {
          'Content-Type': 'application/json',
          'traceparent': traceparent,
        },
      });

      const data = await response.json();
      setCount(data.count);
      span.end();  // End the span
      console.log('Span ended:', {
        endTime: span.endTime,
        _ended: span._ended,
        duration: span.duration
      });
    } catch (error) {
      faroInstance.api.pushError(error);  // Push the error to Faro
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="App">
      <h1>Hello, Faro with OpenTelemetry!</h1>
      <button onClick={handleClick}>Click Me to Trigger Backend</button>
      <p>Button clicked {count} times</p>
    </div>
  );
}

export default App;