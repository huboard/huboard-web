require 'test_helper'

include HealthChecking::HealthChecks
describe HealthChecking::HealthChecks::HealthCheck do

  #Mock the Dependencies
  class TestMixin
    include HealthCheck

    name "Test"
    weight :heavy
    authorization :all
    message "Test Message"

    def self.perform(deps); end

    #purely test fixture methods to expose underlying private vars
    def self.check_weight
      @weight
    end
    def self.check_authorization
      @authorization
    end
    def self.check_name
      @name
    end
    def self.check_message
      @message
    end
  end

  #Setup
  before do
    @dependencies = {
      repo: "Repo",
      logged_in: true,
      authorization: :collaborator
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

    it "sets a name on the parent class" do
      assert_equal(TestMixin.check_name, "Test")
    end

    it "sets a message on the parent class" do
      assert_equal(TestMixin.check_message, "Test Message")
    end
  end

  describe "github authorizing" do

    describe "is authorized" do
      it "is true" do
        auth = TestMixin.send(:authorized, @dependencies)
        assert_equal(auth, true)
      end
    end

    describe "is not authorized" do
      it "is false" do
        @dependencies[:authorization] = :all
        auth = TestMixin.send(:authorized, @dependencies)
        assert_equal(auth, true)
      end
    end
  end
end
