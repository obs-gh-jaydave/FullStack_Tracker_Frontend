import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import Grafana Faro SDK components
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { FetchTransport } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

// Initialize Grafana Faro with optimized settings
console.log('Initializing Grafana Faro...');
export const faroInstance = initializeFaro({
  app: {
    name: 'FrontendApp',
    version: '1.0.0',
  },
  // Enable batching of events to reduce network noise.
  batching: {
    enabled: true, // Enable batching to reduce the frequency of network calls
    limit: 100, // Send events in batches of 100
    interval: 300000, // Set batching interval to 5 minutes (300,000ms)
  },
  sessionTracking: {
    enabled: true, // Track session data (you can disable this if not needed)
  },
  instrumentations: [
    // Enable Core Web Vitals, Network Monitoring, and Custom Tracing Instrumentation
    ...getWebInstrumentations({
      enablePerformanceInstrumentation: true, // Enables performance monitoring, such as network activity
      enableResourceInstrumentation: true, // Tracks resources such as images and script loading
    }),
    new TracingInstrumentation({ propagateTraceContext: true }), // Enables trace propagation
  ],
  transports: [
    new FetchTransport({
      url: 'https://<OBSERVE_CUSTOMER_ID>.collect.observeinc.com/v1/http?source=faro',
      requestOptions: {
        headers: {
          'Authorization': 'Bearer <OBSERVE_API_TOKEN>', // Add your Observe API Token
        },
      },
      // Filtering events: only keep logs, errors, custom measurements, and traces
      beforeSend: (events) => {
        return events.filter(event => 
          ['log', 'error', 'measurement', 'trace'].includes(event.domain)  // Send only these domains
        );
      },
      onError: (error) => {
        console.error('Error sending traces:', error);
      },
    }),
  ],
});

console.log('Grafana Faro initialized');

// Add tracing instrumentation directly after initialization
faroInstance.instrumentations.add(new TracingInstrumentation());
console.log('Tracing Instrumentation Added');

// Capture Core Web Vitals
reportWebVitals((metric) => {
  const { id, name, value } = metric;
  console.log(`Captured web vital: ${name} - ${value}`);

  try {
    faroInstance.api.pushMeasurement({
      type: 'web_vital', // Event type: web vital
      values: {
        [name]: value,  // Use the metric name as the key (e.g., LCP, FID, CLS)
      },
      meta: {
        id,
        name,
      },
    });
    console.log(`Pushed web vital: ${name}`);
  } catch (error) {
    console.error('Error pushing measurement:', error);
  }
});

// Custom function to collect system metrics (CPU, memory) periodically
function pushSystemMetrics() {
  try {
    // Example function to collect memory usage (requires implementation)
    const memoryUsage = getMemoryUsage();  // Define this function for memory metrics
    faroInstance.api.pushMeasurement({
      type: 'system_metrics',
      values: {
        memoryUsage,
      },
    });
    console.log('Pushed system metrics');
  } catch (error) {
    console.error('Error pushing system metrics:', error);
  }
}

// Example of how to collect memory usage
function getMemoryUsage() {
  if (window.performance && window.performance.memory) {
    return (window.performance.memory.usedJSHeapSize / window.performance.memory.totalJSHeapSize).toFixed(2); // Memory usage percentage
  }
  return 0; // Return 0 if memory API is not supported
}

// Periodically send system metrics (every minute)
setInterval(() => {
  pushSystemMetrics();
}, 60000); // Push system metrics every 60 seconds

// Render the React app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);