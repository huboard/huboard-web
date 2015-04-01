require 'test_helper'

include HealthChecking::HealthChecks
describe HealthChecking::HealthChecks::HealthCheck do

  #Mock the Dependencies
  class TestMixin
    include HealthCheck

    weight :heavy
    authorization :all

    authorize!
    def perform(deps); end

    #purely test fixture methods to expose underlying private vars
    def self.check_weight
      @weight
    end
    def self.check_authorization
      @authorization
    end
  end

  #Setup
  before do
    @dependencies = {
      board: "Board",
      current_user: "User",
      repo: "Repo"
    }
  end

  #Assert
  describe "On Mixin" do

    it "sets a weight on the parent class" do
      assert_equal(TestMixin.check_weight, :heavy)
    end

    it "sets an authorization level on the parent class" do
      assert_equal(TestMixin.check_authorization, :all)
    end
  end

  describe "Authorizing" do

    it "authorizes before performing" do
      TestMixin.perform(@dependencies)
    end

  end
end
