import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.min.css'; // Import Material Design Icons
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'myCustomTheme',
    themes: {
      myCustomTheme: {
        colors: {
          primary: '#1976d2',
          secondary: '#424242',
          border: '#ccc',
          link: '#1e88e5', // Default link color (blue)
          linkHover: '#1565c0', // Hover link color (darker blue)
          text: '#666666', // Text color
          error: '#FF5252', // Red for error
          warning: '#FB8C00', // Orange for warning
          success: '#4CAF50', // Green for success
        },
      },
    },
  },
});