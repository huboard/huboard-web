if ENV['RAYGUN_APIKEY']
  Raygun.setup do |config|
    config.api_key = ENV['RAYGUN_APIKEY']
    config.filter_parameters = Rails.application.config.filter_parameters

    # The default is Rails.env.production?
    config.enable_reporting = !Rails.env.development? && !Rails.env.test?
  end
  if ENV['SIDEKIQ']
    require 'raygun/sidekiq'
  end
end
