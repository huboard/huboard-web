Raygun.setup do |config|
  config.api_key = ENV['RAYGUN_APIKEY'] || "some_fake_key"
  config.filter_parameters = Rails.application.config.filter_parameters

  # The default is Rails.env.production?
  config.enable_reporting = Rails.env.production?  &&
    ENV['HUBOARD_ENV'] == 'production'

end
if ENV['SIDEKIQ']
  require 'raygun/sidekiq'
end
