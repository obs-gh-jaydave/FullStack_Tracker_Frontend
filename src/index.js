import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import Grafana Faro SDK components
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { FetchTransport } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

// Initialize Grafana Faro with optimized settings to reduce network noise
console.log('Initializing Grafana Faro...');
export const faroInstance = initializeFaro({
  app: {
    name: 'FrontendApp',
    version: '1.0.0',
  },
  batching: {
    enabled: true,
    limit: 100,  // Batch more events before sending
    interval: 300000,  // Set batching interval to 5 minutes (300,000ms) to reduce network requests
  },
  sessionTracking: {
    enabled: true,  
  },
  instrumentations: [
    ...getWebInstrumentations({
      enablePerformanceInstrumentation: false,  // Disable resource and performance tracking to reduce noise
    }),
    new TracingInstrumentation({ propagateTraceContext: true }),  // Enable tracing instrumentation for custom traces
  ],
  transports: [
    new FetchTransport({
      url: 'https://<OBSERVE_CUSTOMER_ID>.collect.observeinc.com/v1/http?source=faro',
      requestOptions: {
        headers: {
          'Authorization': 'Bearer <OBSERVE_API_TOKEN>',
        },
      },
      beforeSend: (events) => {
        // Filter out non-essential events (e.g., resource events), only send logs, errors, and traces
        return events.filter(event => 
          ['log', 'error', 'measurement', 'trace'].includes(event.domain)  // Keep only logs, errors, custom measurements, and traces
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
      type: 'web_vital',
      values: {
        [name]: value,  // Use the metric name as the key
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

// // Add button to trigger a custom trace
// window.onload = () => {
//   const button = document.createElement('button');
//   button.innerHTML = 'Click me to generate a trace';
//   button.id = 'traceButton';
//   document.body.appendChild(button);

//   button.addEventListener('click', () => {
//     try {
//       faroInstance.api.pushLog([{
//         level: 'info',
//         message: 'User clicked the button',
//         attributes: {
//           interaction: 'buttonClick',
//         },
//       }]);
//       console.log('Button clicked, log sent.');
//     } catch (error) {
//       console.error('Error pushing log:', error);
//     }
//   });
// };

// // Send periodic custom metrics (e.g., memory and CPU usage) every minute
// setInterval(() => {
//   try {
//     const memoryUsage = getMemoryUsage();  // Implement this function
//     faroInstance.api.pushMeasurement({
//       type: 'system_metrics',
//       values: {
//         memoryUsage,
//       },
//     });
//     console.log('Pushed memory usage');
//   } catch (error) {
//     console.error('Error pushing system metrics:', error);
//   }
// }, 60000);  // Every minute

// // Function to get memory usage (you need to implement this)
// function getMemoryUsage() {
//   return window.performance && window.performance.memory
//     ? window.performance.memory.usedJSHeapSize / window.performance.memory.totalJSHeapSize
//     : 0;
// }

// Render the React app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);