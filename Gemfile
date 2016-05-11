source 'https://rubygems.org'
ruby '2.3.1' if ENV['DYNO']

gem 'rails', '4.2.6'
gem 'dotenv-rails', '~> 2.0.0', :require => 'dotenv/rails-now'
# gem 'pg'
gem 'sass-rails', '~> 5.0'
gem 'uglifier', '>= 1.3.0'
gem 'coffee-rails', '~> 4.1.0'
# gem 'therubyracer', platforms: :ruby
gem "ember-cli-rails", '0.1.13', require: nil
gem 'ember-rails-assets'
gem 'rails_12factor', group: :production
gem 'puma'
gem 'foreman'
gem 'sprockets-rails','3.0.0.beta1', :require => 'sprockets/railtie'

# warden
gem 'warden-github', '1.4.0', github: 'huboard/warden-github'

gem 'jquery-rails'
gem 'jbuilder', '~> 2.0'
gem 'sdoc', '~> 0.4.0', group: :doc

# gem 'bcrypt', '~> 3.1.7'
gem 'ghee'
gem 'hashie'
gem 'dalli'
gem 'faraday'
gem 'faraday-http-cache'
gem 'connection_pool'
gem 'addressable'
gem 'kgio'
gem 'carrierwave_direct'
gem 'memcachier'
gem 'solid_use_case'
gem 'faye'
gem 'faye-redis'
gem 'redis'
gem 'sucker_punch'
gem 'raygun4ruby'
gem 'rack-attack'
gem 'redcarpet'

gem 'pdfkit'
gem 'wkhtmltopdf-heroku'
gem 'private_pub', '1.0.3'
gem 'sinatra', :require => nil
gem 'sidekiq', "~> 3.0"

# BUNDLE_WITHOUT="development:test:saas"
gem 'saas','0.0.1', require: nil, path: "vendor/engines/saas"
gem 'faye_extensions','0.0.1', path: 'vendor/gems/faye_extensions'
gem 'responders'
gem 'stripe-rails', require: nil
gem 'heroku-deflater', group: :production

group :development, :test do
  #gem 'byebug'
  #gem 'web-console', '~> 2.0'
  gem 'spring'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'meta_request'
  gem 'pry-byebug'
  gem 'annotate'
  gem 'rspec'
  gem 'couchrest'
  gem 'httparty'
  gem 'mocha'
end

