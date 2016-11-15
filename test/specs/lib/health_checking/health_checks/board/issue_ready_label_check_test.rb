require 'test_helper'

describe 'IssueReadyLabelCheck' do

  it 'performs' do
    mock_board = mock('Board Object')
    mock_board.stubs(:other_labels).returns([{'name' => 'ready'}])

    deps = {board: mock_board}
    sut = HealthChecking::HealthChecks::Board::IssueReadyLabelCheck.new deps

    result = sut.perform(deps)
    assert_equal(true, result)
  end

  it 'treats' do
    mock_board = mock('Board Object')
    mock_board.stubs(:create_label).returns(true)

    deps = {board: mock_board}
    sut = HealthChecking::HealthChecks::Board::IssueReadyLabelCheck.new deps

    result = sut.treat(deps)
    assert_equal(true, result)
  end
end
