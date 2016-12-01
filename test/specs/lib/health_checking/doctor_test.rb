require 'test_helper'

describe HealthChecking::Doctor do

  #Mock Dependencies
  class TestCheck1
    include HealthChecking::HealthChecks::HealthCheck
    def _authorization; :collaborator; end
    def _name; 'Test1'; end
    def _message; 'TestMessage1'; end
    def _weight; :feather; end
    def perform(deps); end
  end
  class TestCheck2
    include HealthChecking::HealthChecks::HealthCheck
    def _authorization; :collaborator; end
    def _name; 'Test2'; end
    def _message; 'TestMessage2'; end
    def _weight; :lead; end
    def perform(deps); end
  end
  class MockBoardExam
    attr_reader :deps
    def initialize(deps)
      @deps = deps
    end
    def checks
      [TestCheck1, TestCheck2]
    end
  end

  #Setup


  before do
    @dependencies = {
      board: "board",
      logged_in: true,
      authorization: :collaborator
    }
  end

  let(:board_exam){ MockBoardExam.new(@dependencies) }
  let(:sut){ HealthChecking::Doctor.new(board_exam) }

  #Assert
  describe "On Init" do
    it "it sets an exam" do
      assert_equal(sut.exam, board_exam)
      assert_equal(sut.payload, [])
    end
  end

  describe "Performing All Checks" do

    before do
    end

    it "should perform on all the checks" do
      TestCheck1.any_instance.expects(:perform).with(@dependencies)
      TestCheck2.any_instance.expects(:perform).with(@dependencies)

      sut.check
    end

    it "returns the exams health checks" do
      board_exam.expects(:checks).returns(@health_checks)
      assert_equal(sut.exam.checks, @health_checks)
    end

    describe "Check is Authorized and Passes" do
      it "performs a successful health check based on the exam" do
        TestCheck1.any_instance.expects(:perform).with(@dependencies)
          .returns(true)

        payload = sut.check
        assert(payload.first[:success])
        assert_equal(2, sut.payload.size)
      end
    end

    describe "Check is Authorized and Fails" do
      it "performs a failed health check based on the exam" do
        TestCheck1.any_instance.expects(:perform).with(@dependencies)
          .returns(false)

        payload = sut.check
        refute(payload.first[:success])
        assert_equal(2, sut.payload.size)
      end
    end

    describe "Check is not Authorized" do
      it "performs no health check" do
        deps = {
          board: "board",
          logged_in: true,
          authorization: :all
        }
        board_exam = MockBoardExam.new(deps)
        sut = HealthChecking::Doctor.new(board_exam)

        payload = sut.check
        refute(payload.first[:success])
        assert_equal(2, sut.payload.size)
      end
    end
  end

end
