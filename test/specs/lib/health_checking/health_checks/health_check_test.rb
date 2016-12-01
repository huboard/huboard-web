require 'test_helper'

describe HealthChecking::HealthChecks::HealthCheck do

  #Mock the Dependencies
  class TestMixin
    include HealthChecking::HealthChecks::HealthCheck

    name "Test"
    weight :heavy
    authorization :all
    message "Test Message"

    def perform(deps); end
  end

  class AllCheck
    include HealthChecking::HealthChecks::HealthCheck

    name "Test"
    weight :heavy
    authorization :all
    message "Test Message"

    def perform(deps); end

  end
  class CollabCheck
    include HealthChecking::HealthChecks::HealthCheck

    name "Test"
    weight :heavy
    authorization :collaborator
    message "Test Message"

    def perform(deps); end

  end
  class AdminCheck
    include HealthChecking::HealthChecks::HealthCheck

    name "Test"
    weight :heavy
    authorization :admin
    message "Test Message"

    def perform(deps); end
  end

  describe HealthChecking::HealthChecks::HealthCheck do
    describe "#authorized?" do
      describe "with context all" do
        subject {
          { 
            board: "board", 
            logged_in: true, 
            authorization: :all 
          }
        }
        
        it 'passes for all' do 
          assert(AllCheck.new(subject).authorized?)
        end

        it 'fails for collaborator' do 
          refute(CollabCheck.new(subject).authorized?)
        end

        it 'fails for admin' do 
          refute(AdminCheck.new(subject).authorized?)
        end
      end
      describe "when collaborator" do
        subject {
          { 
            board: "board", 
            logged_in: true, 
            authorization: :collaborator
          }
        }
        
        it 'passes for all' do 
          assert(AllCheck.new(subject).authorized?)
        end

        it 'fails for collaborator' do 
          assert(CollabCheck.new(subject).authorized?)
        end

        it 'fails for admin' do 
          refute(AdminCheck.new(subject).authorized?)
        end
      end
      describe "when admin" do
        subject {
          { 
            board: "board", 
            logged_in: true, 
            authorization: :admin
          }
        }
        
        it 'passes for all' do 
          assert(AllCheck.new(subject).authorized?)
        end

        it 'fails for collaborator' do 
          assert(CollabCheck.new(subject).authorized?)
        end

        it 'fails for admin' do 
          assert(AdminCheck.new(subject).authorized?)
        end
      end
    end

    describe '#check' do
      describe 'with authorized check' do
        subject { AdminCheck.new(authorization: :admin) }

        it 'should return pass payload' do
          subject.expects(:perform).returns(true)
          payload = subject.check
          assert(payload[:success])
        end

        it 'should return fail payload' do
          subject.expects(:perform).returns(false)
          payload = subject.check
          refute(payload[:success])
        end
      end
      describe 'with unauthorized check' do
        subject { AdminCheck.new(authorization: :collaborator) }

        it 'should return not authorized payload' do
          payload = subject.check
          refute(payload[:success])
        end
      end
    end

    describe '#treatment' do
      describe 'with authorized check' do
        subject { AdminCheck.new(authorization: :admin) }

        it 'should return pass payload' do
          subject.expects(:treat).returns(true)
          payload = subject.treatment
          assert(payload[:success])
        end

        it 'should return fail payload' do
          subject.expects(:treat).returns(false)
          payload = subject.treatment
          refute(payload[:success])
        end
      end
      describe 'with unauthorized check' do
        subject { AdminCheck.new(authorization: :collaborator) }

        it 'should return not authorized payload' do
          payload = subject.treatment
          refute(payload[:success])
        end
      end
    end

    describe "dsl methods" do
      before do
        @dependencies = {
          board: "board",
          logged_in: true,
          authorization: :collaborator
        }
        @sut = TestMixin.new @dependencies
      end

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

  #Setup

end
