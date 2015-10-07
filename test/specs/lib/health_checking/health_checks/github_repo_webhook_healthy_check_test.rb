require 'test_helper'

describe 'GithubRepoWebhookHealthyCheck' do

  let(:sut){ HealthChecking::HealthChecks::GithubRepoWebhookHealthyCheck.new }

  describe 'performs' do
    it 'skips if there is no hook' do
      mock_board = mock('Board Object')
      mock_board.stubs(:hook_exists?).returns(false)

      deps = {board: mock_board}
      result = sut.perform(deps)
      assert_equal(false, result)
    end

    let(:mock_board){ mock('Board Object') }

    it 'passes when the hook is healthy' do
      response = {
        "last_response" => {"code"=>200, "status"=>"active", "message"=>"OK"}
      }
      mock_board.stubs(:hook_exists?).returns(true)
      mock_board.stubs(:hook).returns(response)

      deps = {board: mock_board}
      result = sut.perform(deps)
      assert_equal(true, result)
    end

    it 'passes when the hook is unused' do
      response = {
        "last_response" => {"code"=>nil, "status"=>"unused", "message"=>nil}
      }
      mock_board.stubs(:hook_exists?).returns(true)
      mock_board.stubs(:hook).returns(response)

      deps = {board: mock_board}
      result = sut.perform(deps)
      assert_equal(true, result)
    end

    it 'fails when the hook is unhealthy' do
      response = {
        "last_response" => {"code"=>204, "status"=>"active", "message"=>"NOT OK"}
      }
      mock_board.stubs(:hook_exists?).returns(true)
      mock_board.stubs(:hook).returns(response)

      deps = {board: mock_board}
      result = sut.perform(deps)
      assert_equal(false, result)
    end
  end
end
