require 'test_helper'

describe 'IssueCommentableCheck' do

  it 'performs' do
    @deps = {logged_in: true}
    @sut = HealthChecking::HealthChecks::IssueCommentableCheck.new

    result = @sut.perform(@deps)
    assert_equal(true, result)
  end
end
