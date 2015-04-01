require 'test_helper'

include HealthChecking
describe HealthChecking::Checker do

  #Mock Dependencies
  module HealthChecking
    module HealthChecks
      class TestCheck1
        def perform(deps); end
      end
      class TestCheck2
        def perform(deps); end
      end
    end
    class BoardCheck
      attr_reader :deps
      def initialize(deps)
        @deps = deps
      end
      def checks; end
    end
  end

  #Setup
  before do
    @dependencies = {
      repo: "Repo",
      logged_in: true,
      authorization: :collaborator
    }
    @health_checks = [HealthChecks::TestCheck1, HealthChecks::TestCheck2]
    @board_check = BoardCheck.new(@dependencies)
    @health_checker = Checker.new(@board_check)
  end

  #Assert
  describe "On Init" do
    it "it sets the interface" do
      assert_equal(@health_checker.interface, @board_check)
      assert_equal(@health_checker.payload, [])
    end
  end

  describe "Performing Checks" do
    it "performs a health check based on the interface" do
      @board_check.expects(:checks).returns(@health_checks)
      HealthChecks::TestCheck1.expects(:perform).with(@dependencies)
        .returns({payload: 'payload1'})
      HealthChecks::TestCheck2.expects(:perform).with(@dependencies)
        .returns({payload: 'payload2'})

      @payload = @health_checker.check
      assert_equal({payload: 'payload1'}, @payload[0])
      assert_equal({payload: 'payload2'}, @payload[1])
    end

    it "returns the interfaces health checks" do
      @board_check.expects(:checks).returns(@health_checks)

      assert_equal(@health_checker.checks, @health_checks)
    end
  end
end
