require 'test_helper'

module Saas
  class App; end
end

class TestExistsJob; end
class TestJob; end
class Saas::App::TestExistsJob; end

class JobResolverTest < ActiveSupport::TestCase
  test "should return a no op proc" do
    assert JobResolver.find_jobs(controller: "herp", action: "derp") == [JobResolver::Noop] 
  end

  test "should resolve a test class" do
    assert JobResolver.find_jobs(controller: "test", action: "exists") == [Saas::App::TestExistsJob, TestExistsJob, TestJob]
  end

  test "should resolve the generic fallback class" do
    assert JobResolver.find_jobs(controller: "test", action: "not_exists") == [TestJob]
  end
end
