# FullStack Tracker Frontend

This is the **frontend submodule** of the **FullStack Tracker** project, designed to track user interactions, capture Core Web Vitals, monitor system metrics, and link frontend traces with backend spans for end-to-end observability. It leverages **Grafana Faro** for frontend instrumentation and **Observe** as the telemetry backend.

For an overview of the entire project and the backend setup, please visit the main repository here: [FullStack Tracker Main Repository](https://github.com/obs-gh-jaydave/FullStack_Tracker/blob/main/README.MD).

## Features

- **Core Web Vitals Tracking**: Automatically captures and reports metrics such as First Input Delay (FID), Largest Contentful Paint (LCP), and Cumulative Layout Shift (CLS).
- **Custom User Tracing**: Allows custom traces for user interactions, network activity, and system performance, which are correlated with backend spans.
- **System Metrics Observation**: Captures frontend-specific system metrics like memory and CPU usage.
- **Network Activity Monitoring**: Tracks network requests from the browser and associates them with user activities.

## Project Structure

This submodule focuses on the **React** frontend of the FullStack Tracker project:
- `src/`: Contains all the React components and logic for telemetry.
- `index.js`: Initializes Grafana Faro SDK and defines observability configuration for sending telemetry to **Observe**.

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `npm start`
Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The app will reload if you make edits, and any lint errors will be visible in the console.

#### `npm test`
Launches the test runner in the interactive watch mode. You can configure tests in the `src/` folder.

#### `npm run build`
Builds the app for production to the `build` folder. It bundles React in production mode and optimizes the build for better performance. The app is now ready for deployment.

#### `npm run eject`
If you need to customize the build process further, you can run this command to expose all configuration files. **This operation is irreversible!**

## Integration with Observe

This project uses **Grafana Faro** and **Observe** to capture frontend traces, logs, and metrics. Make sure to configure your **Observe** credentials in the following files:

1. **`src/index.js`**:
   - Update your **Observe** customer ID and API token in the Grafana Faro `initializeFaro` call.
   - This allows you to send Core Web Vitals, custom traces, and frontend logs to Observe.

```js
new FetchTransport({
  url: 'https://<OBSERVE_CUSTOMER_ID>.collect.observeinc.com/v1/http?source=faro',
  requestOptions: {
    headers: {
      'Authorization': 'Bearer <OBSERVE_API_TOKEN>',
    },
  },
});
```

2. For a full setup and connection with the backend, refer to the main repository [FullStack Tracker Main README](https://github.com/obs-gh-jaydave/FullStack_Tracker/blob/main/README.MD).

## Learn More

To learn more about **React**, visit the [React documentation](https://reactjs.org/).

For further details on **Create React App**, check out the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

If you need help setting up **Observe**, visit their official documentation [here](https://docs.observeinc.com/).