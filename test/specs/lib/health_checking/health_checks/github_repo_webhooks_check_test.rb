require 'test_helper'

describe 'HealthChecks Specs' do

  it 'GithubRepoWebhooksCheck' do
    HealthChecking::HealthChecks::GithubRepoWebhooksCheck.new
  end
end
