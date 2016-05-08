ENV['RACK_ENV'] ||= 'development'

require "bundler/setup"
require 'warden/github'

if ENV['MULTI_SCOPE_APP']
  require File.expand_path('../example/multi_scope_app', __FILE__)
else
  require File.expand_path('../example/simple_app', __FILE__)
end

run Example.app
