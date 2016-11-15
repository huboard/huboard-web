require 'test_helper'

describe 'IssueBlockedLabelCheck' do

  it 'performs' do
    mock_board = mock('Board Object')
    mock_board.stubs(:other_labels).returns([{'name' => 'blocked'}])

    deps = {board: mock_board}
    sut = HealthChecking::HealthChecks::Board::IssueBlockedLabelCheck.new

    result = sut.perform(deps)
    assert_equal(true, result)
  end

  it 'treats' do
    mock_board = mock('Board Object')
    mock_board.stubs(:create_label).returns(true)

    deps = {board: mock_board}
    sut = HealthChecking::HealthChecks::Board::IssueBlockedLabelCheck.new

    result = sut.treat(deps)
    assert_equal(true, result)
  end
end
