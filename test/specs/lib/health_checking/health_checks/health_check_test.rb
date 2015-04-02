require 'test_helper'

include HealthChecking::HealthChecks
describe HealthChecks::HealthCheck do

  #Mock the Dependencies
  class TestMixin
    include HealthCheck

    name "Test"
    weight :heavy
    authorization :all
    message "Test Message"

    def perform(deps); end

    #purely test fixture methods to expose underlying private vars
    def check_weight
      @weight
    end
    def check_authorization
      @authorization
    end
    def check_name
      @name
    end
    def check_message
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
    @sut = TestMixin.new
  end

  #Assert
  describe "On Mixin" do

    it "sets a weight on the parent class" do
      assert_equal(:heavy, @sut.check_weight)
    end

    it "sets an authorization level on the parent class" do
      assert_equal(:all, @sut.check_authorization)
    end

    it "sets a name on the parent class" do
      assert_equal("Test", @sut.check_name)
    end

    it "sets a message on the parent class" do
      assert_equal("Test Message", @sut.check_message)
    end
  end

  describe "github authorizing" do

    describe "is authorized" do
      it "is true" do
        auth = @sut.send(:authorized, @dependencies)
        assert_equal(auth, true)
      end
    end

    describe "is not authorized" do
      it "is false" do
        @dependencies[:authorization] = :all
        auth = @sut.send(:authorized, @dependencies)
        assert_equal(auth, true)
      end
    end
  end
end
