require 'test_helper'

describe 'GithubRepoWebhooksCheck' do

  it 'performs' do
    mock_board = mock('Board Object')
    mock_board.stubs(:hook_exists?).returns(true)

    deps = {board: mock_board}
    sut = HealthChecking::HealthChecks::GithubRepoWebhooksCheck.new deps

    result = sut.perform(deps)
    assert_equal(true, result)
  end
end
