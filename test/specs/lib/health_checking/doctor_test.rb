require 'test_helper'

include HealthChecking
describe HealthChecking::Doctor do

  #Mock Dependencies
  module HealthChecking
    class TestCheck1
      def perform(deps); end
    end
    class TestCheck2
      def perform(deps); end
    end
    class BoardExam
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
    @health_checks = [TestCheck1, TestCheck2]
    @board_exam = BoardExam.new(@dependencies)
    @health_checker = Doctor.new(@board_exam)
  end

  #Assert
  describe "On Init" do
    it "it sets an exam" do
      assert_equal(@health_checker.exam, @board_exam)
      assert_equal(@health_checker.payload, [])
    end
  end

  describe "Performing Checks" do
    it "performs a health check based on the exam" do
      @board_exam.expects(:checks).returns(@health_checks)
      TestCheck1.expects(:perform).with(@dependencies)
        .returns({payload: 'payload1'})
      TestCheck2.expects(:perform).with(@dependencies)
        .returns({payload: 'payload2'})

      @payload = @health_checker.check
      assert_equal({payload: 'payload1'}, @payload[0])
      assert_equal({payload: 'payload2'}, @payload[1])
    end

    it "returns the exams health checks" do
      @board_exam.expects(:checks).returns(@health_checks)

      assert_equal(@health_checker.checks, @health_checks)
    end
  end
end
