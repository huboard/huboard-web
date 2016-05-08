require 'simplecov'
SimpleCov.start do
  add_filter '/spec'
  add_filter '/example'
end

require 'warden/github'
require File.expand_path('../../example/simple_app', __FILE__)
require 'rack/test'
require 'addressable/uri'
require 'webmock/rspec'

RSpec.configure do |config|
  config.include(Rack::Test::Methods)

  def app
    Example.app
  end

  def stub_user_session_request
    stub_request(:get, "https://api.github.com/user/sessions/active?browser_session_id=abcdefghijklmnop").
      with(:headers => {'Accept'=>'application/vnd.github.v3+json', 'Accept-Encoding'=>'gzip;q=1.0,deflate;q=0.6,identity;q=0.3', 'Authorization'=>'token the_token', 'Content-Type'=>'application/json', 'User-Agent'=>"Octokit Ruby Gem #{Octokit::VERSION}"})
  end
end
