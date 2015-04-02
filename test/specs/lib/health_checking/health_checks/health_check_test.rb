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
      assert_equal(:heavy, @sut._weight)
    end

    it "sets an authorization level on the parent class" do
      assert_equal(:all, @sut._authorization)
    end

    it "sets a name on the parent class" do
      assert_equal("Test", @sut._name)
    end

    it "sets a message on the parent class" do
      assert_equal("Test Message", @sut._message)
    end
  end
end
