ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

#Grab the bridge classes
Dir.glob(Rails.root.join('lib', 'bridge', 'github', '*')).each do |file|
  require_relative file
end

require 'minitest/autorun'
require 'mocha/mini_test'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.

  # Add more helper methods to be used by all tests here...
end

ApplicationController.class_eval do
  #Skips authorization on controller test by
  #overwriting Saas::BeforeAction.check_account
  def check_account; end

  #Don't attempt to queue a job during controller test
  def queue_job; end
end

