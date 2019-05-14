const { Parents, Providers } = require('@pdc/core');
const { ServiceProvider: NotificationServiceProvider } = require('@pdc/service-notification');

class Kernel extends Parents.Kernel {
  alias = [
    Providers.EnvProvider,
    Providers.ConfigProvider,
    Providers.CommandProvider,
  ];

  serviceProviders = [
    NotificationServiceProvider
  ];  
}

export default Kernel;
